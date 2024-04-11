// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SeiyajToken is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable,
    ERC20PausableUpgradeable,
    ERC20PermitUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    using Math for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    uint256 public constant DIVIDEND_MULTIPLIER = 1e9;

    /// @custom:storage-location erc7201:seiyaj.storage.SeiyajToken
    struct SeiyajTokenStorage {
        uint256 _dividendPerToken;
        uint256 _totalDividends;
        // mapping(address => uint256) _dividendBalanceOf;
        // mapping(address => uint256) _dividendCreditedTo;

        mapping(address => bool) _whitelist;
    }
    // keccak256(abi.encode(uint256(keccak256("seiyaj.storage.SeiyajToken")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant SeiyajTokenStorageSlot =
        0x2a01c41ac2eee2a3966bf20036db704f6ad54f95594910f6c763bdbc0ac06100;

    function _getSeiyajTokenStorage()
        private
        pure
        returns (SeiyajTokenStorage storage $)
    {
        assembly {
            $.slot := SeiyajTokenStorageSlot
        }
    }

    event WhitelistUpdated(address indexed account, bool isWhitelisted);
    event DividendsDistributed(uint256 amount, uint256 dividendPerToken);
    event DividendsClaimed(address indexed account, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address defaultAdmin,
        address pauser,
        address minter,
        address burner,
        address upgrader
    ) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ERC20_init("Seiyaj Token", "SYT");
        __ERC20Burnable_init();
        __ERC20Pausable_init();
        __ERC20Permit_init("Seiyaj Token");
        __ReentrancyGuard_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, pauser);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(BURNER_ROLE, burner);
        _grantRole(UPGRADER_ROLE, upgrader);

        _setWhitelist(defaultAdmin, true);
        _setWhitelist(minter, true);
        _setWhitelist(burner, true);

        // _mint(defaultAdmin, 1e6 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) {
        super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 value
    ) public override onlyRole(BURNER_ROLE) {
        super.burnFrom(account, value);
    }

    function getTotalDividends() public view returns (uint256) {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();
        return $._totalDividends;
    }

    function getDividendPerToken() public view returns (uint256) {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();
        return $._dividendPerToken;
    }

    function distributeDividends()
        external
        payable
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _distributeDividends();
    }

    function _distributeDividends() internal {
        // sanity check
        require(totalSupply() > 0, "SeiyajToken: No tokens minted yet");
        require(
            msg.value > 0,
            "SeiyajToken: Dividend amount must be greater than 0"
        );

        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();

        $._totalDividends += msg.value;

        _updateDividendPerToken();

        emit DividendsDistributed(msg.value, $._dividendPerToken);
    }

    function _updateDividendPerToken() internal {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();

        $._dividendPerToken = $._totalDividends.mulDiv(
            DIVIDEND_MULTIPLIER,
            totalSupply()
        );
        
    }

    function claimDividends() public nonReentrant {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();

        uint256 owing = _dividendOwing(msg.sender);
        require(owing > 0, "SeiyajToken: No dividends to claim");

        $._totalDividends -= owing;
        $._dividendPerToken = $._totalDividends.mulDiv(
            DIVIDEND_MULTIPLIER,
            totalSupply()
        );

        (bool success, ) = msg.sender.call{value: owing}("");
        require(success, "SeiyajToken: Failed to send dividend");

        emit DividendsClaimed(msg.sender, owing);
    }

    function _dividendOwing(address account) internal view returns (uint256) {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();

        uint256 owing = $._dividendPerToken.mulDiv(
            balanceOf(account),
            DIVIDEND_MULTIPLIER
        );
        return owing;
    }

    function isWhitelisted(address account) public view returns (bool) {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();
        return $._whitelist[account];
    }

    function setWhitelists(
        address[] memory accounts,
        bool[] memory whitelistSettings
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        //validate input
        require(
            accounts.length == whitelistSettings.length,
            "SeiyajToken: array length mismatch"
        );

        for (uint256 i = 0; i < accounts.length; i++) {
            require(
                accounts[i] != address(0),
                "SeiyajToken: zero address in accounts"
            );

            _setWhitelist(accounts[i], whitelistSettings[i]);
        }
    }

    function _setWhitelist(address account, bool whitelistSetting) internal {
        SeiyajTokenStorage storage $ = _getSeiyajTokenStorage();
        $._whitelist[account] = whitelistSetting;

        emit WhitelistUpdated(account, whitelistSetting);
    }

    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(0)) {
            if (amount == type(uint).max) {
                amount = address(this).balance;
            }
            (bool success, ) = recipient.call{value: amount}("");
            require(success, "Failed transfer");
        } else {
            if (amount == type(uint).max) {
                amount = IERC20(token).balanceOf(address(this));
            }

            IERC20(token).safeTransfer(recipient, amount);
        }
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    // The following functions are overrides required by Solidity.

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20Upgradeable, ERC20PausableUpgradeable) {
        SeiyajTokenStorage storage s = _getSeiyajTokenStorage();

        if (from != address(0) && !s._whitelist[from]) {
            revert("SeiyajToken: transfer from non-whitelisted address");
        }
        if (to != address(0) && !s._whitelist[to]) {
            revert("SeiyajToken: transfer to non-whitelisted address");
        }
        super._update(from, to, value);

        _updateDividendPerToken();
    }
}
