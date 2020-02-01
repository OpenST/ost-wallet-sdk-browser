import ethAbi from 'ethereumjs-abi';
import BigNumber from 'bignumber.js';
import * as ethUtil from "ethereumjs-util";

const LOG_TAG = "OstTransactionSigner";
const DIRECT_TRANSFER = "direct transfer";
const PRICER = "pricer";

const DIRECT_TRANSFERS = "directTransfers";

let ikmInstance = null;

export default class OstTransactionSigner {
	constructor(ikm) {
		ikmInstance = ikm;
	}

	/**
	 * Sign transaction
	 * @param txnData
	 */
	signTransactionData(txnData) {
		const oThis = this
			, rule = txnData.rule
			, tokenHolderAddresses = txnData.to_token_holder_addresses
			, userTokenHolderAddress = txnData.from_token_holder_addresses
			, amounts = txnData.amounts
			, session = txnData.session
			, options = txnData.options
		;

		if (!rule) {
			throw "Rule object not found";
		}

		if (!rule.address) {
			throw "Rule Address not found";
		}

		if (!session) {
			throw "Session object not found";
		}

		if (!tokenHolderAddresses || !Array.isArray(tokenHolderAddresses)) {
			throw "Token holder addresses is not an Array";
		}

		if (!amounts || !Array.isArray(amounts)) {
			throw "Amounts is not an Array";
		}

		if (amounts.length !== tokenHolderAddresses.length) {
			throw "tokenHolderAddresses is not an equal to amounts";
		}

		const userId = ikmInstance.userId;
		const checkTokenHolderAddresses = this.toCheckSumAddresses(tokenHolderAddresses);

		const ruleNameLowerCase = rule.name.toLowerCase();
		let callData = null;
		let rawCallData = null;
		let spendingBtAmountInWei = new BigNumber(0);

		switch (ruleNameLowerCase) {

			case DIRECT_TRANSFER:
				console.log(LOG_TAG, "In Direct Transfer");
				console.log(LOG_TAG, "Building call data");

				callData = oThis.getTransactionExecutableData(tokenHolderAddresses, amounts);
				rawCallData = oThis.getTransactionRawCallData(tokenHolderAddresses, amounts);
				spendingBtAmountInWei = oThis.calDirectTransferSpendingLimit(amounts);
				break;

			case PRICER:
				//Todo: Price implementation
				break;

			default:
				throw "Rule name not found"
		}

		const ruleAddress = rule.address
			, sessionAddress = session.address;


		const eip1077TxnHash = oThis.createEIP1077TxnHash(callData, ruleAddress, userTokenHolderAddress, session.nonce);

		return ikmInstance.signWithSession(sessionAddress, eip1077TxnHash)
			.then((signature) => {
				return Object.assign({}, txnData, {
					signature: signature,
					raw_call_data: rawCallData,
					call_data: callData
				});
			})
			.catch((err) => {
				console.error(LOG_TAG, "Transaction Signing failed", err);
				throw "Transaction signing failed";
			});
	}

	/**
	 *
	 * Test Example
	 * Address : 0xebe35A9dC1Aea4775b824EdCc8093bA25faBf0CC
	 * amount : 1000000
	 * callData = 0x94ac7a3f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ebe35a9dc1aea4775b824edcc8093ba25fabf0cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240
	 *
	 * raw call data = {"method":"directTransfers","parameters":[["0xebe35A9dC1Aea4775b824EdCc8093bA25faBf0CC"],["1000000"]]}
	 *
	 * rule Address= 0x19784E6190436A50195CfD0c5d9334f254e3017D
	 * session address = 0x8e6a96bC778bbAE86894F86901697c7689d7040c | 1 nonce
	 *
	 * 0x97ebe030
	 * token holder =0x3677e3E20F389332A4855c44260767ECA55a5599
	 * eip1077 {"value":"0","gasPrice":"0","gas":"0","gasToken":"0","operationType":"0","nonce":"1","to":"0x19784E6190436A50195CfD0c5d9334f254e3017D","from":"0x3677e3E20F389332A4855c44260767ECA55a5599","data":"0x94ac7a3f000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000ebe35a9dc1aea4775b824edcc8093ba25fabf0cc000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f4240","extraHash":"0x0","callPrefix":"0x97ebe030"}
	 *
	 *
	 * Hex valueTo hash = 19003677e3e20f389332a4855c44260767eca55a559919784e6190436a50195cfd0c5d9334f254e3017d00364df3be02f0571e06f43f9696722025842afbf7dc61b4f27a67376921b729f2000000000000000000000000000000000000000000000000000000000000000100000097ebe030000000000000000000000000000000000000000000000000000000000000000000
	 * eip1077TxnHash = 0xc6ace6dd7a28ba14961ba2543696573463bada56c0975e2627862fac91b0ab95
	 *
	 *
	 * @param tokenHolderAddresses
	 * @param amounts
	 */
	getTransactionExecutableData(tokenHolderAddresses, amounts) {
		const encodedString = ethAbi.simpleEncode("directTransfers(address[],uint256[])", tokenHolderAddresses, amounts);
		return '0x' + encodedString.toString('hex');
	}

	getTransactionRawCallData(tokenHolderAddresses, amounts) {
		return {
			method: DIRECT_TRANSFERS,
			parameters: [tokenHolderAddresses, amounts]
		};
	}

	calDirectTransferSpendingLimit(amounts) {
		let  bigInteger = new BigNumber(0);
		for (let i = 0; i < amounts.length; i++) {
			bigInteger = bigInteger.plus(new BigNumber(amounts[i]));
		}
		return bigInteger.toString();
	}

	toCheckSumAddresses(addressList) {
		const checkSumAddressList = [];
		for (let i = 0; i < addressList.length; i++) {
			const address = ethUtil.toChecksumAddress(addressList[i]);
			checkSumAddressList.push(address);
		}
		return checkSumAddressList;
	}

	createEIP1077TxnHash(callData, ruleAddress, tokenHolderAddress ,nonce) {
		let txnHash;
		const oThis = this
			, toAddress = ruleAddress
			, fromAddress = tokenHolderAddress;

		const typeObject = [
			{t: 'bytes', v: Buffer.from('19', 'hex')},
			{t: 'bytes', v: Buffer.from('00', 'hex')},
			{t: 'address', v: fromAddress},
			{t: 'address', v: toAddress},
			{t: 'uint8', v: '0'},
			{t: 'bytes', v: oThis.sha3(callData)},
			{t: 'uint256', v: String(nonce)},
			{t: 'uint8', v: '0'},
			{t: 'uint8', v: '0'},
			{t: 'uint8', v: '0'},
			{t: 'bytes4', v: oThis.getCallPrefix()},
			{t: 'uint8', v: '0'},
			{t: 'bytes32', v: '0x00'}
		];

		const types = [];
		const values = [];
		for (let i=0; i<typeObject.length; i++) {
			let object = typeObject[i];
			types.push(object.t);
			values.push(object.v);
		}

		txnHash = ethAbi.soliditySHA3(types, values);
		return txnHash;
	}

	sha3(callData) {
		return ethUtil.keccak256(callData);
	}

	getCallPrefix() {
		const EXECUTABLE_CALL_STRING = "executeRule(address,bytes,uint256,bytes32,bytes32,uint8)";

		const hexString = '0x' + ethUtil.keccak256(EXECUTABLE_CALL_STRING).toString('hex');
		return hexString.substring(0,10);
	}
}