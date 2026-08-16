// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AquaMonPool - DePIN Water Conservation & Impact Settlement on Monad
 * @notice Receives IoT telemetry data from Relayer, tracks water consumption per resident,
 *         calculates water savings against baseline quotas, and issues $AQMON ERC-20 tokens.
 * @dev Aligned with Gold Standard Water Benefit Certificate rules (1 m³ / 1,000 L saved = 1 $AQMON).
 */

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external;
}

contract AquaMonPool {
    string public constant name = "AquaMon Water Credit";
    string public constant symbol = "AQMON";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;
    address public relayer;

    // Daily benchmark flow limit per session in Liters * 100 (2.00 L benchmark flow per ping)
    uint256 public constant BENCHMARK_FLOW_SCALED = 200; 
    
    // Reward multiplier: 1,000 Liters saved = 1 $AQMON token (10^18 wei)
    uint256 public constant WEI_PER_SAVED_LITER = 10**18 / 1000; 

    struct ResidentData {
        uint256 totalLitersScaled;   // Liters * 100
        uint256 currentDayUsage;     // Liters * 100 today
        uint256 lastUpdateTimestamp;
        uint256 pendingAqmonRewards; // In wei (10^18)
        uint256 totalAqmonClaimed;   // In wei (10^18)
        uint256 telemetriesLogged;   // Total ping count
    }

    mapping(address => ResidentData) public residents;
    uint256 public totalNetworkLitersScaled;
    uint256 public totalTelemetriesLogged;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event RelayerUpdated(address indexed previousRelayer, address indexed newRelayer);
    event TelemetryRecorded(
        address indexed resident,
        uint256 litersScaled,
        uint256 newTotalLitersScaled,
        uint256 timestamp
    );
    event RewardsAccrued(address indexed resident, uint256 rewardAmountWei);
    event TokensClaimed(address indexed resident, uint256 amountWei);

    modifier onlyOwner() {
        require(msg.sender == owner, "AquaMonPool: Only owner");
        _;
    }

    modifier onlyRelayer() {
        require(msg.sender == relayer || msg.sender == owner, "AquaMonPool: Only relayer or owner");
        _;
    }

    constructor(address _relayer) {
        owner = msg.sender;
        relayer = _relayer != address(0) ? _relayer : msg.sender;
    }

    function setRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "AquaMonPool: Invalid relayer address");
        emit RelayerUpdated(relayer, _newRelayer);
        relayer = _newRelayer;
    }

    /**
     * @notice Records telemetry data from IoT meter for a resident.
     * @param resident The EVM wallet address of the apartment resident.
     * @param litersScaled Liters consumed * 100 (e.g., 1.45 L -> 145).
     */
    function recordTelemetry(address resident, uint256 litersScaled) external onlyRelayer {
        require(resident != address(0), "AquaMonPool: Invalid resident address");

        ResidentData storage data = residents[resident];

        data.totalLitersScaled += litersScaled;
        data.currentDayUsage += litersScaled;
        data.lastUpdateTimestamp = block.timestamp;
        data.telemetriesLogged += 1;

        totalNetworkLitersScaled += litersScaled;
        totalTelemetriesLogged += 1;

        // Reward Calculation based on water SAVED:
        // If flow is conserving (< 2.00 L benchmark flow per ping), calculate instant $AQMON saved credit
        if (litersScaled < BENCHMARK_FLOW_SCALED) {
            uint256 litersSavedScaled = BENCHMARK_FLOW_SCALED - litersScaled;
            uint256 rewardWei = (litersSavedScaled * WEI_PER_SAVED_LITER) / 100;
            
            if (rewardWei > 0) {
                data.pendingAqmonRewards += rewardWei;
                emit RewardsAccrued(resident, rewardWei);
            }
        }

        emit TelemetryRecorded(resident, litersScaled, data.totalLitersScaled, block.timestamp);
    }

    /**
     * @notice Allows residents to claim accrued $AQMON tokens to their EVM wallet.
     */
    function claimTokens() external {
        ResidentData storage data = residents[msg.sender];
        uint256 amountToClaim = data.pendingAqmonRewards;
        require(amountToClaim > 0, "AquaMonPool: No pending $AQMON rewards");

        data.pendingAqmonRewards = 0;
        data.totalAqmonClaimed += amountToClaim;

        _mint(msg.sender, amountToClaim);
        emit TokensClaimed(msg.sender, amountToClaim);
    }

    /**
     * @notice Mints new $AQMON tokens (internal).
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "AquaMonPool: Mint to zero address");
        totalSupply += amount;
        balanceOf[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    /**
     * @notice Standard ERC-20 transfer.
     */
    function transfer(address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "AquaMonPool: Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @notice Standard ERC-20 approve.
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @notice Standard ERC-20 transferFrom.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[sender] >= amount, "AquaMonPool: Insufficient balance");
        require(allowance[sender][msg.sender] >= amount, "AquaMonPool: Insufficient allowance");
        
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    /**
     * @notice View resident statistics.
     */
    function getResidentStats(address resident) external view returns (
        uint256 totalLiters,
        uint256 currentDayLiters,
        uint256 pendingRewardsWei,
        uint256 totalClaimedWei,
        uint256 pingsLogged,
        uint256 aqmonBalanceWei
    ) {
        ResidentData memory data = residents[resident];
        return (
            data.totalLitersScaled / 100,
            data.currentDayUsage / 100,
            data.pendingAqmonRewards,
            data.totalAqmonClaimed,
            data.telemetriesLogged,
            balanceOf[resident]
        );
    }

    /**
     * @notice View global network statistics.
     */
    function getNetworkStats() external view returns (
        uint256 totalNetworkLiters,
        uint256 totalPings,
        uint256 totalAqmonMinted
    ) {
        return (
            totalNetworkLitersScaled / 100,
            totalTelemetriesLogged,
            totalSupply
        );
    }
}
