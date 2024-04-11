const hre = require("hardhat");
const { ethers } = require("ethers");
const { log } = require("console");
const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
require("@openzeppelin/hardhat-upgrades");

const proxyOptions = {
	kind: "uups",
	constructorArgs: [],
};

describe("SeiyajToken Dividend", () => {
	let SeiyajTokenFactory;
	let seiyajToken;
	let defaultAdmin,
		pauser,
		minter,
		burner,
		upgrader,
		addr1,
		addr2,
		addr3,
		addrs;
	let signer1;

	beforeEach(async () => {
		[
			addr1,
			addr2,
			addr3,
			defaultAdmin,
			pauser,
			minter,
			burner,
			upgrader,
			...addrs
		] = await hre.ethers.getSigners();

		SeiyajTokenFactory = await hre.ethers.getContractFactory("SeiyajToken");
		const seiyajTokenProxyOptions = {
			...proxyOptions,
			constructorArgs: [],
		};
		seiyajToken = await hre.upgrades.deployProxy(
			SeiyajTokenFactory,
			[
				defaultAdmin.address,
				pauser.address,
				minter.address,
				burner.address,
				upgrader.address,
			],
			seiyajTokenProxyOptions,
		);
		await seiyajToken.waitForDeployment();
	});

	describe("distributeDividends", function () {
		beforeEach(async () => {
			await seiyajToken
				.connect(defaultAdmin)
				.setWhitelists([addr1.address, addr2.address], [true, true]);
		});

		it("should fail if no tokens are minted", async () => {
			await expect(
				seiyajToken
					.connect(defaultAdmin)
					.distributeDividends({ value: ethers.parseEther("1") }),
			).to.be.revertedWith("SeiyajToken: No tokens minted yet");
		});

		it("should fail if dividend amount is 0", async () => {
			await seiyajToken
				.connect(minter)
				.mint(addr1.address, ethers.parseEther("100"));
			await expect(
				seiyajToken
					.connect(defaultAdmin)
					.distributeDividends({ value: ethers.parseEther("0") }),
			).to.be.revertedWith(
				"SeiyajToken: Dividend amount must be greater than 0",
			);
		});

		it("should distribute dividends correctly", async () => {
			let ethAmount = ethers.parseEther("1");
			let mintAmount = ethers.parseEther("100");
			await seiyajToken.connect(minter).mint(addr1.address, mintAmount);

			await expect(
				seiyajToken
					.connect(defaultAdmin)
					.distributeDividends({ value: ethAmount }),
			)
				.to.emit(seiyajToken, "DividendsDistributed")
				.withArgs(
					ethAmount,
					(BigInt(ethAmount) * BigInt(1e9)) / BigInt(mintAmount),
				);

			expect(await seiyajToken.getTotalDividends()).to.equal(ethAmount);
			expect(await seiyajToken.getDividendPerToken()).to.equal(
				(BigInt(ethAmount) * BigInt(1e9)) / BigInt(mintAmount),
			);

			await seiyajToken.connect(minter).mint(addr2.address, mintAmount);

			expect(await seiyajToken.getDividendPerToken()).to.equal(
				(BigInt(ethAmount) * BigInt(1e9)) / (BigInt(mintAmount) * 2n),
			);
		});
	});

	describe("claimDividends", async () => {
		let ethAmount = ethers.parseEther("1");
		let mintAmount = ethers.parseEther("100");

		beforeEach(async () => {
			await seiyajToken
				.connect(defaultAdmin)
				.setWhitelists(
					[addr1.address, addr2.address, addr3.address],
					[true, true, true],
				);

			await seiyajToken.connect(minter).mint(addr1.address, mintAmount);
			await seiyajToken
				.connect(defaultAdmin)
				.distributeDividends({ value: ethAmount });
			await seiyajToken.connect(minter).mint(addr2.address, mintAmount);
		});

		it("Should fail if caller has no balance", async () => {
			await expect(
				seiyajToken.connect(addr3).claimDividends(),
			).to.be.revertedWith("SeiyajToken: No dividends to claim");
		});

		it("Claim dividends should succeed", async () => {
			await seiyajToken.connect(minter).mint(addr3.address, mintAmount);
			await expect(seiyajToken.connect(addr1).claimDividends())
				.to.emit(seiyajToken, "DividendsClaimed")
				.withArgs(
					addr1.address,
					(((BigInt(ethAmount) * BigInt(1e9)) /
						BigInt(mintAmount * 3n)) *
						BigInt(mintAmount)) /
						BigInt(1e9),
				);
		});
	});
});
