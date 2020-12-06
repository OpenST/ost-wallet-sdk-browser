# OST JSON APIs

OST JSON APIs are a set of *asynchronous* methods that make API calls to OST Platform servers.

## Entity API

### Get Current Device
API to get user's current device.
> While the equivalent getter method `OstSdk.getCurrentDevice` gives the data stored in browser's database, 
> this method makes an API call to OST Platform.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/


/**
  getCurrentDevice return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/


let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getCurrentDevice(userId)
    .then( (result) => { 
      console.log( result ); 
    })
    .catch( (error) => { 
      console.log( error ); 
    });
```

##### Sample Response
```json
{
  "data": {
    "result_type": "device",
    "device": {
      "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
      "address": "0xd1d2773b372dc1be0131c3313c9ae77b0619a08f",
      "linked_address": null,
      "api_signer_address": "0x39d63831ef5f2949d607f069c97eac9fff72ecd9",
      "status": "REGISTERED",
      "updated_timestamp": 1581934429
    }
  }
}

```

### Get Balance
API to get user's balance.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getBalance return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';

OstJsonApi.getBalance(userId)
  .then( (result) => { 
    console.log( result ); 
  })
  .catch( (error) => { 
    console.log( error) ; 
  });

```

##### Sample Response

```json
{
  "data": {
    "result_type": "balance",
    "balance": {
      "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
      "total_balance": "668197398",
      "available_balance": "668197398",
      "unsettled_debit": "0",
      "updated_timestamp": 1582026731
    }
  }
}

```

### Get Price Point
API to get price-points of token's staking currency (OST or USDC).
> This API call is generally needed to compute the current fiat value to your brand-tokens. 
> E.g. displaying user's balance in fiat.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getPricePoint return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getPricePoint( userId )
  .then( (result) => { 
    console.log( result ); 
  })
  .catch( (error) => {
    console.log( error ); 
  });


```

##### Sample Response
```json
{
  "data": {
    "result_type": "price_point",
    "price_point": {
      "USDC": {
        "USD": 1.013832252,
        "EUR": 0.935885787,
        "GBP": 0.7775079541,
        "decimals": 18,
        "updated_timestamp": 1582026913
      }
    }
  }
}
```
### Get Balance And Price Points
This is a convenience method that makes `OstJsonApi.getBalance` and `OstJsonApi.getPricePoint` API calls and merges the response.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getBalanceWithPricePoint() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getBalanceWithPricePoint(userId)
  .then( ( result ) => {
    console.log( result ); 
  })
  .catch( ( error ) => {
    console.log( error ); 
  });
```

##### Sample Response
```json
{
  "data": {
    "balance": {
      "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
      "total_balance": "668197398",
      "available_balance": "668197398",
      "unsettled_debit": "0",
      "updated_timestamp": 1582026731
    },
    "price_point": {
      "USDC": {
        "USD": 1.013832252,
        "EUR": 0.935885787,
        "GBP": 0.7775079541,
        "decimals": 18,
        "updated_timestamp": 1582026913
      }
    }
  }
}
```

### Get Token Holder
It returns token holder of current user id.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getTokenHolder() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getTokenHolder(userId)
  .then( ( result ) => {
    console.log( result ); 
  })
  .catch( ( error ) => {
    console.log( error ); 
  });
```

##### Sample Response
```json
{
  "data": {
    "result_type": "token_holder",
    "token_holder": {
      "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
      "address": "0x3677e3e20f389332a4855c44260767eca55a5599",
      "status": "LOGGED OUT",
      "updated_timestamp": 1582027107
    }
  }
}
```


### Get Token
It returns token of current user id.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getToken() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getToken (userId)
  .then( ( result ) => {
    console.log( result ); 
  })
  .catch( ( error ) => {
    console.log( error ); 
  });
```

##### Sample Response
```json
{
  "data": {
    "result_type": "token",
    "token": {
    "id": 1400,
    "name": "Popcorn",
    "symbol": "POP",
    "base_token": "OST",
    "conversion_factor": 10,
    "total_supply": "1000000000000",
    "decimals": 18,
    "origin_chain": {
      "chain_id": 3,
      "branded_token": "0x18cbeae2f1785abf68c9984f9186a29ed062c3ca",
      "organization": {
        "contract": "0x0260a404804b1d7cf6fa678fb5d8441495cfff1b",
        "owner": "0x8986922410e5d8cf43cfc94c1b51dcf8dfdf7637"
    },
    "stakers": [
      "0x8986922410e5d8cf43cfc94c1b51dcf8dfdf7637"
    ]
  },
  "auxiliary_chains": [
  {
    "chain_id": 197,
    "utility_branded_token": "0xc50e3fd492a9a99a964f7aff8d755075d0732ff0",
    "company_token_holders": [
      "0x93f08d0c5d7bc28cc117681b3b23f8501a09e786"
    ],
    "company_uuids": [
      "d6bf0061-a32d-48af-a29b-013260a947f3"
    ],
    "organization": {
      "contract": "0xb8e3fcfb5dac714e40b63489f4f393c7073fdbb3",
      "owner": "0x8986922410e5d8cf43cfc94c1b51dcf8dfdf7637"
    }
  }
  ],
    "updated_timestamp": 1560167796
  }
  }
}
```

### Get User
It returns current user information.
##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/

/**
  getUser() return a promise. Promise return response in .then() and .catch() returns the error, if any occurred.
*/

let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getUser (userId)
  .then( ( result ) => {
    console.log( result ); 
  })
  .catch( ( error ) => {
    console.log( error ); 
  });
```

##### Sample Response
```json
{
  "data": {
    "result_type": "user",
    "user": {
      "id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
      "token_id": 1400,
      "token_holder_address": "0x3677e3e20f389332a4855c44260767eca55a5599",
      "device_manager_address": "0xb2b29acf564647d1d924b0f06b9539d0c65cc34a",
      "recovery_address": "0xb94768e6373d05454e828d5128e9f37120d26722",
      "recovery_owner_address": "0x674e0525c6023dda7d57d35c07cb59c9a73091f4",
      "type": "user",
      "status": "ACTIVATED",
      "updated_timestamp": 1582027107
    }
  }
}
```

## List API
All `List` APIs support pagination. The response of all `List` APIs has an extra attribute `meta`.
To determine if next page is available, the app should look at `meta["next_page_payload"]`. 
If `meta["next_page_payload"]` is an empty object (`{}`), next page is not available.

### Get Transactions
API to get user's transactions.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/


let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
let nextPagePayload = null;

OstJsonApi.getTransactions(userId)
  .then( (result) => { 
    console.log( result ); 
     if ( response.meta ) {
      let nextPagePayloadFromResponse = response.meta.next_page_payload || {};
      if ( Object.keys(nextPagePayloadFromResponse).length > 0 ) {
        // Next page is available.
        // Update nextPagePayload 
        nextPagePayload = nextPagePayloadFromResponse;
        // To fetch the next page, pass the updated nextPagePayload.
      }
    }
  })
  .catch( (err) => {
    console.log(err);
  });

```

##### Sample Response
```json
{
  "data": {
    "result_type": "transactions",
    "transactions": [
      {
        "id": "388caa2e-437e-4e1b-9a0e-154505b71bf7",
        "transaction_hash": "0x894091aaac276736903a09dbe5883f2f5d4f289ae581e643876f29171730a0bf",
        "from": "0x6ecbfdb2ebac8669c85d61dd028e698fd6403589",
        "to": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "nonce": 1290,
        "value": "0",
        "gas_price": "1000000000",
        "gas_used": 120484,
        "transaction_fee": "120484000000000",
        "block_confirmation": 684,
        "status": "SUCCESS",
        "updated_timestamp": 1582026713,
        "block_timestamp": 1582026712,
        "block_number": 8231867,
        "rule_name": "Pricer",
        "meta_property": {},
        "transfers": [
        {
        "from": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "from_user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "to": "0x9b2b6b72829b96d3cb332dd29fbd88616368fe07",
        "to_user_id": "2849b2f2-6b67-4bcf-9d38-2971c26d2da7",
        "amount": "98682",
        "kind": "transfer"
        }
      ]
      },
      {
        "id": "46f9a482-549e-4182-b5a4-cf0527b9ef65",
        "transaction_hash": "0xa58a8e40d269e9421d78a9e00022396ca544e26e8b1483ddad1facf0633d3cce",
        "from": "0x6ecbfdb2ebac8669c85d61dd028e698fd6403589",
        "to": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "nonce": 1289,
        "value": "0",
        "gas_price": "1000000000",
        "gas_used": 135420,
        "transaction_fee": "135420000000000",
        "block_confirmation": 705,
        "status": "SUCCESS",
        "updated_timestamp": 1582026649,
        "block_timestamp": 1582026649,
        "block_number": 8231846,
        "rule_name": "Pricer",
        "meta_property": {},
        "transfers": [
        {
        "from": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "from_user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "to": "0x9b2b6b72829b96d3cb332dd29fbd88616368fe07",
        "to_user_id": "2849b2f2-6b67-4bcf-9d38-2971c26d2da7",
        "amount": "98682",
        "kind": "transfer"
        }
        ]
      },
      {
        "id": "f7ffe8ae-7661-47a3-ba7f-584bd6c87208",
        "transaction_hash": "0x29e193e857dad48239e02379e159460c5554ccaa08b83c887548cb0b24d2f9ec",
        "from": "0x6ecbfdb2ebac8669c85d61dd028e698fd6403589",
        "to": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "nonce": 1288,
        "value": "0",
        "gas_price": "1000000000",
        "gas_used": 120548,
        "transaction_fee": "120548000000000",
        "block_confirmation": 984,
        "status": "SUCCESS",
        "updated_timestamp": 1582025813,
        "block_timestamp": 1582025812,
        "block_number": 8231567,
        "rule_name": "Pricer",
        "meta_property": {},
        "transfers": [
        {
        "from": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "from_user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "to": "0x936ed4fdaa58baa808d40969bb366944a0fb32fa",
        "to_user_id": "943a8797-5a48-478d-89b3-186962012e51",
        "amount": "1068778",
        "kind": "transfer"
        }
        ]
      },
      ...
      ...
      {
        "id": "06a76d5a-df78-4859-8972-688827c167f1",
        "transaction_hash": "0x39ef38df20d8f3779352176f009ee339c9c5e9c5132c8bef865a86ce9c04f20a",
        "from": "0x6ecbfdb2ebac8669c85d61dd028e698fd6403589",
        "to": "0x3677e3e20f389332a4855c44260767eca55a5599",
        "nonce": 1277,
        "value": "0",
        "gas_price": "1000000000",
        "gas_used": 109170,
        "transaction_fee": "109170000000000",
        "block_confirmation": 2230,
        "status": "SUCCESS",
        "updated_timestamp": 1582022076,
        "block_timestamp": 1582022074,
        "block_number": 8230321,
        "rule_name": "Direct Transfer",
        "meta_property": {},
        "transfers": [
          {
            "from": "0x3677e3e20f389332a4855c44260767eca55a5599",
            "from_user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
            "to": "0x9b2b6b72829b96d3cb332dd29fbd88616368fe07",
            "to_user_id": "2849b2f2-6b67-4bcf-9d38-2971c26d2da7",
            "amount": "1000000",
            "kind": "transfer"
          }
        ]
      }
    ],
    "meta": {
      "next_page_payload": {
        "pagination_identifier": "*****************************************************"
      },
      "total_no": 123
    }
  }
}
```

### Get Device List
API to get user's devices.

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/
let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
let nextPagePayload = null;

OstJsonApi.getDeviceList(userId)
  .then( (result) => {
    console.log( result ); 
     if ( response.meta ) {
      let nextPagePayloadFromResponse = response.meta.next_page_payload || {};
      if ( Object.keys(nextPagePayloadFromResponse).length > 0 ) {
        // Next page is available.
        // Update nextPagePayload 
        nextPagePayload = nextPagePayloadFromResponse;
        // To fetch the next page, pass the updated nextPagePayload.
      }
    }
  })
  .catch( (error) => {
    console.log(error); 
  });

```
##### Sample Response
```json
{
  "data": {
    "result_type": "devices",
    "devices": [
      {
        "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "address": "0xfea19be74fbe4df0cede2de6cd5af3d60267ff7c",
        "linked_address": null,
        "api_signer_address": "0x50f9ff8e7ceb8db4eebf28360840a17429b46a2f",
        "status": "REGISTERED",
        "updated_timestamp": 1581935012
      },
      {
        "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "address": "0xfd3f096ce80fae9e5635c2515a92fc5e7c060a8f",
        "linked_address": null,
        "api_signer_address": "0x9ce3ff670b4480a4b56229bca931c7eeccfaf858",
        "status": "REGISTERED",
        "updated_timestamp": 1581718031
      },

      {
        "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "address": "0xf7f6802d9d75a4226166d56673c2db46ce26abfc",
        "linked_address": null,
        "api_signer_address": "0x6e68f248705a662775de69c8cb3fabecba166a87",
        "status": "REGISTERED",
        "updated_timestamp": 1581681928
      },
      {
        "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "address": "0xf780f20996e75599fe71befd04dc94960e182a3a",
        "linked_address": null,
        "api_signer_address": "0xb699544515315c1bfae19061f11ccf71b288bf2f",
        "status": "REGISTERED",
        "updated_timestamp": 1580459311
      },
      ...
      ...
      {
        "user_id": "dabd272f-b330-4c99-a3f7-aaf38012ef5f",
        "address": "0xf244bf4f870e36239448a622f576e51ce9f115ad",
        "linked_address": null,
        "api_signer_address": "0xa0fd42ee5b5cc13fc55618e2f7fd095bfbcb7532",
        "status": "REGISTERED",
        "updated_timestamp": 1580736515
      }
    ],
    "meta": {
      "next_page_payload": {
        "pagination_identifier": "*****************************************************" 
      }
    }
  }
}
```

### Get Rules

##### Usage
```
/*
  Please update userId as per your needs. 
  Since this userId does not belong to your economy, you will get an error if you do not change it.
*/
let userId = 'dabd272f-b330-4c99-a3f7-aaf38012ef5f';
OstJsonApi.getRules(userId)
  .then( (result) => {
    console.log( result ); 
  })
  .catch( (error) => {
    console.log(error); 
  });

```
##### Sample Response
```json
{
  "data": {
    "result_type": "rules",
    "rules": [
    {
      "id": 1,
      "token_id": 1129,
      "name": "Pricer",
      "address": "0xeb7a84a777e6e899039eb35ea43c467493f0c93d",
      "abi": [
      {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "bytes3"
        }
      ],
      "name": "baseCurrencyPriceAcceptanceMargins",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "organization",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "tokenDecimals",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      ...
      ... 
      ],
      "updated_timestamp": 1558519153
    }
    
```



