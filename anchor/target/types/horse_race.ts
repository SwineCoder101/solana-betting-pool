/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/horse_race.json`.
 */
export type HorseRace = {
  "address": "3U8ZsW8cd3GNcu69AhksaNEoeBCh8sHywvCHbm7mxaHz",
  "metadata": {
    "name": "horseRace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "runCreateCompetition",
      "discriminator": [
        85,
        21,
        141,
        208,
        23,
        187,
        111,
        68
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "competition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  101,
                  116,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenA",
          "type": "pubkey"
        },
        {
          "name": "priceFeedId",
          "type": "string"
        },
        {
          "name": "admin",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "houseCutFactor",
          "type": "u8"
        },
        {
          "name": "minPayoutRatio",
          "type": "u8"
        }
      ]
    },
    {
      "name": "runUpdateCompetition",
      "discriminator": [
        210,
        126,
        133,
        97,
        83,
        143,
        202,
        83
      ],
      "accounts": [
        {
          "name": "competition",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "tokenA",
          "type": "pubkey"
        },
        {
          "name": "priceFeedId",
          "type": "string"
        },
        {
          "name": "admin",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "houseCutFactor",
          "type": "u8"
        },
        {
          "name": "minPayoutRatio",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "competition",
      "discriminator": [
        193,
        49,
        76,
        118,
        106,
        22,
        221,
        106
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized: Not a whitelisted admin or deployer."
    }
  ],
  "types": [
    {
      "name": "competition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenA",
            "type": "pubkey"
          },
          {
            "name": "priceFeedId",
            "type": "string"
          },
          {
            "name": "houseCutFactor",
            "type": "u8"
          },
          {
            "name": "minPayoutRatio",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
