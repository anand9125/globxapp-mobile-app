import { Globx } from "./globxIdl";

export const PROGRAM_ID = "MYCYuW3qGtkaG9pFq1WKfgWr69pWpGf846erKHCq4dz" as const;

export type { Globx };

// IDL will be loaded from JSON file in production
// For now, we'll use the type definition
// In production, load from: import IDL from "./globx.json"
export const GlobxIDL: any = {
    "address": "12bb1viTKCnqXNDD9WYspden8HgyDDPjwuKd785aiNRm",
    "metadata": {
        "name": "globx",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "cancel_proposal",
            "docs": [
                "Cancel a governance proposal",
                "",
                "Cancels a pending proposal before execution.",
                "",
                "# Security",
                "- Only governance authority can cancel",
                "- Cannot cancel executed proposals"
            ],
            "discriminator": [
                106,
                74,
                128,
                146,
                19,
                65,
                39,
                23
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority"
                    ],
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "proposal",
                    "docs": [
                        "Proposal to cancel"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    112,
                                    111,
                                    115,
                                    97,
                                    108
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "proposal.proposal_id",
                                "account": "GovernanceProposal"
                            }
                        ]
                    }
                }
            ],
            "args": []
        },
        {
            "name": "create_proposal",
            "docs": [
                "Create a governance proposal",
                "",
                "All configuration changes (except pause) must go through the",
                "proposal system with appropriate timelock delays.",
                "",
                "# Arguments",
                "* `action_type` - Type of governance action",
                "* `action_data` - Encoded parameters for the action",
                "",
                "# Timelock Durations",
                "- Pause: 0 (instant, but use pause() instead)",
                "- Unpause: 24 hours",
                "- Config changes: 24 hours",
                "- Program upgrade: 72 hours",
                "",
                "# Security",
                "- Only governance authority can create proposals",
                "- Proposals cannot move funds directly",
                "- All proposals are public and monitored"
            ],
            "discriminator": [
                132,
                116,
                68,
                174,
                216,
                160,
                198,
                22
            ],
            "accounts": [
                {
                    "name": "authority",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "proposal_counter",
                    "docs": [
                        "Proposal counter"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    112,
                                    111,
                                    115,
                                    97,
                                    108,
                                    95,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116,
                                    101,
                                    114
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "proposal",
                    "docs": [
                        "Proposal"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    112,
                                    111,
                                    115,
                                    97,
                                    108
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "proposal_counter.next_id",
                                "account": "ProposalCounter"
                            }
                        ]
                    }
                },
                {
                    "name": "system_program",
                    "docs": [
                        "System program"
                    ],
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "action_type",
                    "type": {
                        "defined": {
                            "name": "GovernanceActionType"
                        }
                    }
                },
                {
                    "name": "action_data",
                    "type": "bytes"
                }
            ]
        },
        {
            "name": "deposit_to_main",
            "docs": [
                "Transfer tokens from Deposit vault to Main vault",
                "",
                "Admin operation to consolidate deposits into trading liquidity.",
                "",
                "# Arguments",
                "* `params` - Transfer parameters (amount, transfer_id)",
                "",
                "# Flow",
                "1. Validate both vaults are operational",
                "2. Verify transfer direction (Deposit → Main)",
                "3. Execute PDA-signed transfer",
                "4. Update audit trails on both vaults",
                "5. Emit VaultTransfer event",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Directional enforcement"
            ],
            "discriminator": [
                82,
                214,
                237,
                80,
                43,
                90,
                140,
                132
            ],
            "accounts": [
                {
                    "name": "authority",
                    "signer": true
                },
                {
                    "name": "deposit_vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "main_vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    105,
                                    110
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "deposit_vault_token_account",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "deposit_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "main_vault_token_account",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "main_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "token_mint"
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "DepositToMainParams"
                        }
                    }
                }
            ]
        },
        {
            "name": "execute_proposal",
            "docs": [
                "Execute a governance proposal",
                "",
                "Applies the configuration change after timelock expires.",
                "",
                "# Security",
                "- Proposal must be past timelock",
                "- Proposal must not be expired (7 days after executable)",
                "- Only governance authority can execute"
            ],
            "discriminator": [
                186,
                60,
                116,
                133,
                108,
                128,
                111,
                28
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority"
                    ],
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "proposal",
                    "docs": [
                        "Proposal"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    112,
                                    111,
                                    115,
                                    97,
                                    108
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": []
        },
        {
            "name": "execute_swap",
            "docs": [
                "Execute a token swap via Jupiter or Kamino",
                "",
                "The core trading function. Swaps tokens through whitelisted DEX routes",
                "after validating all on-chain invariants.",
                "",
                "# Arguments",
                "* `params` - Swap parameters (amount, slippage, route data)",
                "",
                "# Flow",
                "1. Validate all invariants (pause, size, daily cap, whitelist)",
                "2. Deduct platform fee to treasury",
                "3. Execute CPI to Jupiter/Kamino",
                "4. Verify output meets minimum requirements",
                "5. Update daily volume tracking",
                "6. Emit events for off-chain indexing",
                "",
                "# Security",
                "- ALL invariant checks MUST pass",
                "- PDA signs the transfer (no human keys)",
                "- Slippage protection enforced",
                "- Daily volume cap limits exposure",
                "",
                "# Errors",
                "- `ProtocolPaused` - Protocol is paused",
                "- `TradeExceedsMaxSize` - Trade too large",
                "- `DailyVolumeLimitExceeded` - Daily cap reached",
                "- `TokenNotAllowed` - Token not whitelisted",
                "- `RouteNotAllowed` - DEX not whitelisted",
                "- `SlippageExceedsMax` - Slippage too high",
                "- `InsufficientOutput` - Output below minimum"
            ],
            "discriminator": [
                56,
                182,
                124,
                215,
                155,
                140,
                157,
                102
            ],
            "accounts": [
                {
                    "name": "vault",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "vault_input_token",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "input_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "vault_output_token",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "output_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "input_mint"
                },
                {
                    "name": "output_mint"
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "treasury",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    114,
                                    101,
                                    97,
                                    115,
                                    117,
                                    114,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "treasury_input_token",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "treasury"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "input_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "swap_program",
                    "docs": [
                        "The DEX program to call (Jupiter or Kamino)",
                        "Must be on the allowed_routes whitelist"
                    ]
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "SwapParams"
                        }
                    }
                }
            ]
        },
        {
            "name": "initialize",
            "docs": [
                "Initialize the GlobX protocol",
                "Creates all required PDAs: Vault, Config, Treasury, ProposalCounter.",
                "Can only be called once by the deployer.",
                "",
                "/// # Arguments",
                "* `governance_authority` - Address of the governance multisig",
                "",
                "# Accounts",
                "* `deployer` - Transaction fee payer and initial caller",
                "* `vault` - VaultState PDA to create",
                "* `config` - ConfigState PDA to create",
                "* `treasury` - TreasuryState PDA to create",
                "* `proposal_counter` - ProposalCounter PDA to create",
                "* `system_program` - Solana system program",
                "",
                "# Security",
                "- Called once during deployment",
                "- Sets governance authority (cannot be Pubkey::default)",
                "- Initializes all risk parameters to V0 defaults"
            ],
            "discriminator": [
                175,
                175,
                109,
                31,
                13,
                152,
                155,
                237
            ],
            "accounts": [
                {
                    "name": "signer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "authority"
                },
                {
                    "name": "vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "treasury",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    114,
                                    101,
                                    97,
                                    115,
                                    117,
                                    114,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "proposal_counter",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    112,
                                    114,
                                    111,
                                    112,
                                    111,
                                    115,
                                    97,
                                    108,
                                    95,
                                    99,
                                    111,
                                    117,
                                    110,
                                    116,
                                    101,
                                    114
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "governance_authority",
                    "type": "pubkey"
                }
            ]
        },
        {
            "name": "initialize_three_vaults",
            "docs": [
                "Initialize the three-vault custody architecture",
                "",
                "Creates Deposit, Main, and Withdrawal vault PDAs for enhanced security.",
                "This implements the segregated custody model where funds flow:",
                "User → Deposit → Main → Withdrawal → User",
                "",
                "# Accounts",
                "* `payer` - Transaction fee payer",
                "* `authority` - Governance authority (for reference in event)",
                "* `deposit_vault` - Deposit VaultState PDA to create",
                "* `main_vault` - Main VaultState PDA to create",
                "* `withdrawal_vault` - Withdrawal VaultState PDA to create",
                "",
                "# Security",
                "- Can only be called once",
                "- Creates three separate vault PDAs",
                "- Each vault has specific directional permissions"
            ],
            "discriminator": [
                13,
                123,
                195,
                89,
                217,
                7,
                228,
                201
            ],
            "accounts": [
                {
                    "name": "payer",
                    "docs": [
                        "Account paying for all PDA account creation"
                    ],
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "authority",
                    "docs": [
                        "The governance multisig"
                    ]
                },
                {
                    "name": "deposit_vault",
                    "docs": [
                        "Deposit Vault PDA - entry point for user deposits",
                        "",
                        "Seeds: [\"vault\", \"deposit\"]",
                        "This PDA receives funds from users via user_to_deposit"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "main_vault",
                    "docs": [
                        "Main Vault PDA - primary trading liquidity pool",
                        "",
                        "Seeds: [\"vault\", \"main\"]",
                        "This PDA holds trading liquidity and executes swaps"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    105,
                                    110
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "withdrawal_vault",
                    "docs": [
                        "Withdrawal Vault PDA - staging area for withdrawals",
                        "",
                        "Seeds: [\"vault\", \"withdrawal\"]",
                        "This PDA sends funds to users via withdrawal_to_user"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    119,
                                    105,
                                    116,
                                    104,
                                    100,
                                    114,
                                    97,
                                    119,
                                    97,
                                    108
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "system_program",
                    "docs": [
                        "System program for account creation"
                    ],
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": []
        },
        {
            "name": "initialize_token_account",
            "docs": [
                "Initialize a token account for the vault",
                "",
                "Creates an Associated Token Account for the vault to hold a specific token.",
                "Called after initialize() for each supported token.",
                "",
                "# Accounts",
                "* `payer` - Transaction fee payer",
                "* `vault` - VaultState PDA (owner of the ATA)",
                "* `mint` - Token mint to create ATA for",
                "* `vault_token_account` - ATA to create",
                "",
                "# Security",
                "- Anyone can call (just creates ATA)",
                "- Token must be added to whitelist via governance to be tradeable"
            ],
            "discriminator": [
                150,
                85,
                44,
                28,
                149,
                14,
                210,
                26
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "vault",
                    "docs": [
                        "Vault PDA (owner of the token account)"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "mint"
                },
                {
                    "name": "vault_token_account",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associated_token_program",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                }
            ],
            "args": []
        },
        {
            "name": "initialize_vault_token_account",
            "docs": [
                "Initialize a token account for one of the three vaults",
                "",
                "Creates an ATA for a specific vault and token mint combination.",
                "Must be called for each token on each vault before transfers.",
                "",
                "# Arguments",
                "* `vault_kind` - Which vault to create the token account for",
                "",
                "# Accounts",
                "* `payer` - Transaction fee payer",
                "* `vault` - The vault PDA (validated by kind)",
                "* `mint` - Token mint to create ATA for"
            ],
            "discriminator": [
                144,
                29,
                206,
                193,
                111,
                76,
                77,
                64
            ],
            "accounts": [
                {
                    "name": "payer",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "vault",
                    "docs": [
                        "The vault PDA (owner of the token account)",
                        "Dynamically validates based on vault_kind"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "arg",
                                "path": "vault_kind"
                            }
                        ]
                    }
                },
                {
                    "name": "mint",
                    "docs": [
                        "Token mint to create account for"
                    ]
                },
                {
                    "name": "vault_token_account",
                    "docs": [
                        "The vault's token account (ATA)"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                },
                {
                    "name": "associated_token_program",
                    "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "vault_kind",
                    "type": {
                        "defined": {
                            "name": "VaultKind"
                        }
                    }
                }
            ]
        },
        {
            "name": "main_to_withdrawal",
            "docs": [
                "Transfer tokens from Main vault to Withdrawal vault",
                "",
                "Admin operation to stage funds for pending withdrawals.",
                "",
                "# Arguments",
                "* `params` - Transfer parameters (amount, transfer_id)",
                "",
                "# Flow",
                "1. Validate both vaults are operational",
                "2. Verify transfer direction (Main → Withdrawal)",
                "3. Execute PDA-signed transfer",
                "4. Update audit trails on both vaults",
                "5. Emit VaultTransfer event",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Directional enforcement"
            ],
            "discriminator": [
                185,
                95,
                104,
                206,
                123,
                99,
                171,
                179
            ],
            "accounts": [
                {
                    "name": "authority",
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "main_vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    105,
                                    110
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "withdrawal_vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    119,
                                    105,
                                    116,
                                    104,
                                    100,
                                    114,
                                    97,
                                    119,
                                    97,
                                    108
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "main_vault_token_account",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "main_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "withdrawal_vault_token_account",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "withdrawal_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "token_mint"
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "MainToWithdrawalParams"
                        }
                    }
                }
            ]
        },
        {
            "name": "pause",
            "docs": [
                "Emergency pause the protocol",
                "",
                "Instantly halts all trading. This is the ONLY governance action",
                "without a timelock, designed for emergency response.",
                "",
                "# Security",
                "- Only governance authority can pause",
                "- No timelock (instant effect)",
                "- Unpause requires 24-hour timelock"
            ],
            "discriminator": [
                211,
                22,
                221,
                251,
                74,
                121,
                193,
                47
            ],
            "accounts": [
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority"
                    ],
                    "signer": true
                }
            ],
            "args": []
        },
        {
            "name": "pause_all_vaults",
            "docs": [
                "Pause all three vaults at once (emergency full stop)",
                "",
                "Use for critical security incidents requiring immediate halt",
                "of all fund movements.",
                "",
                "# Arguments",
                "* `reason` - 32-byte reason for audit trail",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Takes effect immediately"
            ],
            "discriminator": [
                224,
                106,
                28,
                87,
                80,
                253,
                166,
                244
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority - only admin can pause all vaults"
                    ],
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration (for authority validation)"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "deposit_vault",
                    "docs": [
                        "Deposit vault - the vault to pause"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "main_vault",
                    "docs": [
                        "Main vault - the vault to pause"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    109,
                                    97,
                                    105,
                                    110
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "withdrawal_vault",
                    "docs": [
                        "Withdrawal vault - the vault to pause"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    119,
                                    105,
                                    116,
                                    104,
                                    100,
                                    114,
                                    97,
                                    119,
                                    97,
                                    108
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "reason",
                    "type": {
                        "array": [
                            "u8",
                            32
                        ]
                    }
                }
            ]
        },
        {
            "name": "pause_vault",
            "docs": [
                "Pause a specific vault (per-vault circuit breaker)",
                "",
                "Allows pausing individual vaults for targeted emergency response.",
                "- Pause Deposit: Block new incoming funds",
                "- Pause Main: Block trading operations",
                "- Pause Withdrawal: Block outgoing funds",
                "",
                "# Arguments",
                "* `params` - Contains vault_kind and reason",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Takes effect immediately (no timelock for emergencies)"
            ],
            "discriminator": [
                250,
                6,
                228,
                57,
                6,
                104,
                19,
                210
            ],
            "accounts": [
                {
                    "name": "authority",
                    "signer": true
                },
                {
                    "name": "config",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "arg",
                                "path": "vault_kind"
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "PauseVaultParams"
                        }
                    }
                }
            ]
        },
        {
            "name": "unpause_vault",
            "docs": [
                "Unpause a specific vault",
                "",
                "Resumes operations for a previously paused vault.",
                "",
                "# Arguments",
                "* `vault_kind` - Which vault to unpause",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Should only be called after incident resolution"
            ],
            "discriminator": [
                125,
                29,
                213,
                213,
                114,
                155,
                125,
                63
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority - only admin can unpause"
                    ],
                    "signer": true
                },
                {
                    "name": "vault",
                    "docs": [
                        "The vault to unpause (dynamically selected by vault_kind)"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "arg",
                                "path": "vault_kind"
                            }
                        ]
                    }
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration (for authority validation)"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                }
            ],
            "args": [
                {
                    "name": "vault_kind",
                    "type": {
                        "defined": {
                            "name": "VaultKind"
                        }
                    }
                }
            ]
        },
        {
            "name": "user_to_deposit",
            "docs": [
                "Deposit tokens from user to Deposit vault",
                "",
                "Entry point for all user funds into the system.",
                "Called after user completes fiat payment.",
                "",
                "# Arguments",
                "* `params` - Deposit parameters (amount, deposit_id)",
                "",
                "# Flow",
                "1. Validate deposit vault is operational",
                "2. Verify token is whitelisted",
                "3. Transfer from source to Deposit vault",
                "4. Update audit trail (total_in)",
                "5. Emit UserToVaultDeposit event",
                "",
                "# Security",
                "- Source authority must sign",
                "- Only Deposit vault can receive external funds"
            ],
            "discriminator": [
                47,
                72,
                92,
                217,
                152,
                152,
                63,
                4
            ],
            "accounts": [
                {
                    "name": "source_authority",
                    "docs": [
                        "This is typically the on-ramp wallet's keypair",
                        "",
                        "SECURITY: Must be a signer to prove ownership of source funds"
                    ],
                    "signer": true
                },
                {
                    "name": "deposit_vault",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    100,
                                    101,
                                    112,
                                    111,
                                    115,
                                    105,
                                    116
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "source_token_account",
                    "writable": true
                },
                {
                    "name": "vault_token_account",
                    "docs": [
                        "Destination token account (Deposit vault's ATA)",
                        "",
                        "SECURITY:",
                        "- Must be the Deposit vault's ATA for this mint",
                        "- Verified by ATA derivation"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "deposit_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "token_mint",
                    "docs": [
                        "Token mint being deposited",
                        "Must be on the whitelist"
                    ]
                },
                {
                    "name": "config",
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "token_program",
                    "docs": [
                        "SPL Token program for transfer"
                    ],
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "UserToDepositParams"
                        }
                    }
                }
            ]
        },
        {
            "name": "withdraw_fees",
            "docs": [
                "Withdraw collected platform fees",
                "",
                "Transfers accumulated fees from treasury to a destination wallet.",
                "",
                "# Arguments",
                "* `amount` - Amount to withdraw",
                "",
                "# Security",
                "- Only governance authority can withdraw fees",
                "- Fees are separate from user funds (treasury vs vault)",
                "- Full audit trail via events"
            ],
            "discriminator": [
                198,
                212,
                171,
                109,
                144,
                215,
                174,
                89
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "Governance authority"
                    ],
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "Protocol configuration"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "treasury",
                    "docs": [
                        "Treasury PDA"
                    ],
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    116,
                                    114,
                                    101,
                                    97,
                                    115,
                                    117,
                                    114,
                                    121
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "treasury_token_account",
                    "docs": [
                        "Treasury's token account"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "treasury"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "destination_token_account",
                    "docs": [
                        "Destination for withdrawn fees"
                    ],
                    "writable": true
                },
                {
                    "name": "mint",
                    "docs": [
                        "Token mint"
                    ]
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdrawal_to_user",
            "docs": [
                "Withdraw tokens from Withdrawal vault to user",
                "",
                "Exit point for all user funds leaving the system.",
                "Admin-initiated for compliance and batch processing.",
                "",
                "# Arguments",
                "* `params` - Withdrawal parameters (amount, withdrawal_id)",
                "",
                "# Flow",
                "1. Validate Withdrawal vault is operational",
                "2. Verify withdrawal limits",
                "3. Execute PDA-signed transfer to destination",
                "4. Update audit trail (total_out)",
                "5. Emit VaultToUserWithdrawal event",
                "",
                "# Security",
                "- Only governance authority can execute",
                "- Only Withdrawal vault can send external funds"
            ],
            "discriminator": [
                0,
                253,
                34,
                209,
                47,
                196,
                148,
                110
            ],
            "accounts": [
                {
                    "name": "authority",
                    "docs": [
                        "The authority that can execute the instruction"
                    ],
                    "signer": true
                },
                {
                    "name": "config",
                    "docs": [
                        "The configuration account"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    99,
                                    111,
                                    110,
                                    102,
                                    105,
                                    103
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "withdrawal_vault",
                    "docs": [
                        "The withdrawal vault"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [
                                    118,
                                    97,
                                    117,
                                    108,
                                    116
                                ]
                            },
                            {
                                "kind": "const",
                                "value": [
                                    119,
                                    105,
                                    116,
                                    104,
                                    100,
                                    114,
                                    97,
                                    119,
                                    97,
                                    108
                                ]
                            }
                        ]
                    }
                },
                {
                    "name": "vault_token_account",
                    "docs": [
                        "The token account for the withdrawal vault"
                    ],
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "account",
                                "path": "withdrawal_vault"
                            },
                            {
                                "kind": "const",
                                "value": [
                                    6,
                                    221,
                                    246,
                                    225,
                                    215,
                                    101,
                                    161,
                                    147,
                                    217,
                                    203,
                                    225,
                                    70,
                                    206,
                                    235,
                                    121,
                                    172,
                                    28,
                                    180,
                                    133,
                                    237,
                                    95,
                                    91,
                                    55,
                                    145,
                                    58,
                                    140,
                                    245,
                                    133,
                                    126,
                                    255,
                                    0,
                                    169
                                ]
                            },
                            {
                                "kind": "account",
                                "path": "token_mint"
                            }
                        ],
                        "program": {
                            "kind": "const",
                            "value": [
                                140,
                                151,
                                37,
                                143,
                                78,
                                36,
                                137,
                                241,
                                187,
                                61,
                                16,
                                41,
                                20,
                                142,
                                13,
                                131,
                                11,
                                90,
                                19,
                                153,
                                218,
                                255,
                                16,
                                132,
                                4,
                                142,
                                123,
                                216,
                                219,
                                233,
                                248,
                                89
                            ]
                        }
                    }
                },
                {
                    "name": "destination_token_account",
                    "docs": [
                        "The token account for the destination"
                    ],
                    "writable": true
                },
                {
                    "name": "token_mint",
                    "docs": [
                        "The mint for the token"
                    ]
                },
                {
                    "name": "token_program",
                    "docs": [
                        "The token program"
                    ],
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": [
                {
                    "name": "params",
                    "type": {
                        "defined": {
                            "name": "WithdrawalToUserParams"
                        }
                    }
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "ConfigState",
            "discriminator": [
                193,
                77,
                160,
                128,
                208,
                254,
                180,
                135
            ]
        },
        {
            "name": "GovernanceProposal",
            "discriminator": [
                53,
                107,
                240,
                190,
                43,
                73,
                65,
                143
            ]
        },
        {
            "name": "ProposalCounter",
            "discriminator": [
                110,
                92,
                147,
                182,
                142,
                28,
                182,
                5
            ]
        },
        {
            "name": "TreasuryState",
            "discriminator": [
                240,
                56,
                226,
                158,
                138,
                244,
                79,
                154
            ]
        },
        {
            "name": "VaultState",
            "discriminator": [
                228,
                196,
                82,
                165,
                98,
                210,
                235,
                152
            ]
        }
    ],
    "events": [
        {
            "name": "CircuitBreakerTriggered",
            "discriminator": [
                58,
                7,
                35,
                109,
                165,
                114,
                119,
                58
            ]
        },
        {
            "name": "ConfigUpdated",
            "discriminator": [
                40,
                241,
                230,
                122,
                11,
                19,
                198,
                194
            ]
        },
        {
            "name": "DailyVolumeReset",
            "discriminator": [
                177,
                19,
                125,
                66,
                239,
                170,
                170,
                10
            ]
        },
        {
            "name": "DepositReceived",
            "discriminator": [
                9,
                208,
                152,
                63,
                64,
                32,
                185,
                118
            ]
        },
        {
            "name": "FeesCollected",
            "discriminator": [
                233,
                23,
                117,
                225,
                107,
                178,
                254,
                8
            ]
        },
        {
            "name": "FeesWithdrawn",
            "discriminator": [
                234,
                15,
                0,
                119,
                148,
                241,
                40,
                21
            ]
        },
        {
            "name": "MintDelisted",
            "discriminator": [
                118,
                184,
                78,
                248,
                170,
                199,
                49,
                148
            ]
        },
        {
            "name": "MintWhitelisted",
            "discriminator": [
                115,
                189,
                255,
                29,
                58,
                192,
                88,
                131
            ]
        },
        {
            "name": "ProposalCancelled",
            "discriminator": [
                253,
                59,
                104,
                46,
                129,
                78,
                9,
                14
            ]
        },
        {
            "name": "ProposalCreated",
            "discriminator": [
                186,
                8,
                160,
                108,
                81,
                13,
                51,
                206
            ]
        },
        {
            "name": "ProposalExecuted",
            "discriminator": [
                92,
                213,
                189,
                201,
                101,
                83,
                111,
                83
            ]
        },
        {
            "name": "ProtocolInitialized",
            "discriminator": [
                173,
                122,
                168,
                254,
                9,
                118,
                76,
                132
            ]
        },
        {
            "name": "ProtocolPaused",
            "discriminator": [
                35,
                111,
                245,
                138,
                237,
                199,
                79,
                223
            ]
        },
        {
            "name": "ProtocolUnpaused",
            "discriminator": [
                248,
                204,
                112,
                239,
                72,
                67,
                127,
                216
            ]
        },
        {
            "name": "RouteDelisted",
            "discriminator": [
                126,
                238,
                90,
                97,
                227,
                99,
                74,
                192
            ]
        },
        {
            "name": "RouteWhitelisted",
            "discriminator": [
                70,
                181,
                155,
                20,
                85,
                209,
                127,
                5
            ]
        },
        {
            "name": "SwapExecuted",
            "discriminator": [
                150,
                166,
                26,
                225,
                28,
                89,
                38,
                79
            ]
        },
        {
            "name": "SwapFailed",
            "discriminator": [
                231,
                12,
                214,
                200,
                111,
                106,
                77,
                44
            ]
        },
        {
            "name": "ThreeVaultsInitialized",
            "discriminator": [
                64,
                153,
                69,
                20,
                27,
                189,
                242,
                128
            ]
        },
        {
            "name": "UserToVaultDeposit",
            "discriminator": [
                165,
                80,
                204,
                134,
                217,
                93,
                149,
                200
            ]
        },
        {
            "name": "VaultPaused",
            "discriminator": [
                198,
                157,
                22,
                151,
                68,
                100,
                162,
                35
            ]
        },
        {
            "name": "VaultReconciliation",
            "discriminator": [
                61,
                57,
                124,
                185,
                230,
                7,
                206,
                97
            ]
        },
        {
            "name": "VaultToUserWithdrawal",
            "discriminator": [
                159,
                63,
                205,
                140,
                63,
                71,
                193,
                85
            ]
        },
        {
            "name": "VaultTransfer",
            "discriminator": [
                156,
                251,
                54,
                92,
                124,
                14,
                101,
                72
            ]
        },
        {
            "name": "VaultUnpaused",
            "discriminator": [
                116,
                95,
                48,
                104,
                229,
                9,
                64,
                84
            ]
        },
        {
            "name": "VolumeWarning",
            "discriminator": [
                106,
                179,
                174,
                5,
                105,
                36,
                190,
                103
            ]
        },
        {
            "name": "WithdrawalProcessed",
            "discriminator": [
                127,
                92,
                169,
                199,
                212,
                241,
                193,
                65
            ]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "AlreadyInitialized",
            "msg": "Protocol has already been initialized"
        },
        {
            "code": 6001,
            "name": "InvalidInitParams",
            "msg": "Invalid initialization parameters"
        },
        {
            "code": 6002,
            "name": "MissingInitAccount",
            "msg": "Missing required initialization account"
        },
        {
            "code": 6003,
            "name": "Unauthorized",
            "msg": "Unauthorized: caller lacks required permissions"
        },
        {
            "code": 6004,
            "name": "GovernanceOnly",
            "msg": "Only governance authority can perform this action"
        },
        {
            "code": 6005,
            "name": "InvalidPdaSigner",
            "msg": "Invalid signer: expected program PDA"
        },
        {
            "code": 6006,
            "name": "AuthorityMismatch",
            "msg": "Authority mismatch: provided key does not match stored authority"
        },
        {
            "code": 6007,
            "name": "MissingSignature",
            "msg": "Missing required signature"
        },
        {
            "code": 6008,
            "name": "InvalidOwner",
            "msg": "Invalid account owner"
        },
        {
            "code": 6009,
            "name": "UnauthorizedGovernance",
            "msg": "Unauthorized: only governance authority can perform this action"
        },
        {
            "code": 6010,
            "name": "InvalidAuthority",
            "msg": "Invalid authority address"
        },
        {
            "code": 6011,
            "name": "InvalidAmount",
            "msg": "Invalid amount: must be greater than zero"
        },
        {
            "code": 6012,
            "name": "AmountBelowMinimum",
            "msg": "Amount below minimum: increase trade size"
        },
        {
            "code": 6013,
            "name": "SlippageExceeded",
            "msg": "Slippage exceeds maximum allowed"
        },
        {
            "code": 6014,
            "name": "SlippageExceedsMax",
            "msg": "Slippage setting exceeds maximum allowed"
        },
        {
            "code": 6015,
            "name": "SlippageTooLow",
            "msg": "Slippage setting is below minimum allowed"
        },
        {
            "code": 6016,
            "name": "FeeTooHigh",
            "msg": "Fee setting exceeds maximum allowed"
        },
        {
            "code": 6017,
            "name": "InvalidMinOutput",
            "msg": "Invalid minimum output amount"
        },
        {
            "code": 6018,
            "name": "TokenNotAllowed",
            "msg": "Token not allowed: mint is not whitelisted"
        },
        {
            "code": 6019,
            "name": "RouteNotAllowed",
            "msg": "Route not allowed: DEX program is not whitelisted"
        },
        {
            "code": 6020,
            "name": "InvalidTokenAccount",
            "msg": "Invalid token account"
        },
        {
            "code": 6021,
            "name": "TokenMintMismatch",
            "msg": "Token mint mismatch"
        },
        {
            "code": 6022,
            "name": "InvalidAta",
            "msg": "Invalid associated token account derivation"
        },
        {
            "code": 6023,
            "name": "InvalidPda",
            "msg": "Invalid PDA derivation"
        },
        {
            "code": 6024,
            "name": "InvalidBump",
            "msg": "Invalid bump seed"
        },
        {
            "code": 6025,
            "name": "InsufficientBalance",
            "msg": "Insufficient balance"
        },
        {
            "code": 6026,
            "name": "EmptyCollection",
            "msg": "Empty collection provided"
        },
        {
            "code": 6027,
            "name": "DuplicateEntry",
            "msg": "Duplicate entry not allowed"
        },
        {
            "code": 6028,
            "name": "MaxCapacityReached",
            "msg": "Maximum capacity reached"
        },
        {
            "code": 6029,
            "name": "ItemNotFound",
            "msg": "Item not found"
        },
        {
            "code": 6030,
            "name": "ProtocolPaused",
            "msg": "Protocol is paused: operations temporarily suspended"
        },
        {
            "code": 6031,
            "name": "TradeExceedsMaxSize",
            "msg": "Trade exceeds maximum size: split into smaller trades"
        },
        {
            "code": 6032,
            "name": "DailyVolumeLimitExceeded",
            "msg": "Daily volume limit exceeded: try again tomorrow"
        },
        {
            "code": 6033,
            "name": "InsufficientOutput",
            "msg": "Insufficient output: price moved unfavorably"
        },
        {
            "code": 6034,
            "name": "SwapFailed",
            "msg": "Swap execution failed"
        },
        {
            "code": 6035,
            "name": "InvalidPriceData",
            "msg": "Invalid price data from oracle"
        },
        {
            "code": 6036,
            "name": "PriceImpactTooHigh",
            "msg": "Price impact too high: reduce trade size"
        },
        {
            "code": 6037,
            "name": "CircuitBreakerTriggered",
            "msg": "Circuit breaker triggered: automatic safety pause"
        },
        {
            "code": 6038,
            "name": "SameTokenSwap",
            "msg": "Cannot swap token for itself"
        },
        {
            "code": 6039,
            "name": "FeeCalculationError",
            "msg": "Fee calculation error"
        },
        {
            "code": 6040,
            "name": "InvalidRouteData",
            "msg": "Invalid swap route data"
        },
        {
            "code": 6041,
            "name": "ProposalNotFound",
            "msg": "Proposal not found"
        },
        {
            "code": 6042,
            "name": "ProposalAlreadyExecuted",
            "msg": "Proposal already executed"
        },
        {
            "code": 6043,
            "name": "ProposalCancelled",
            "msg": "Proposal has been cancelled"
        },
        {
            "code": 6044,
            "name": "TimelockNotElapsed",
            "msg": "Timelock not elapsed: wait for execution window"
        },
        {
            "code": 6045,
            "name": "ProposalExpired",
            "msg": "Proposal expired"
        },
        {
            "code": 6046,
            "name": "InvalidGovernanceAction",
            "msg": "Invalid governance action"
        },
        {
            "code": 6047,
            "name": "InvalidActionData",
            "msg": "Invalid action data for proposal"
        },
        {
            "code": 6048,
            "name": "ProposalNotReady",
            "msg": "Proposal not ready: timelock not elapsed"
        },
        {
            "code": 6049,
            "name": "ParameterOutOfRange",
            "msg": "Parameter value out of range"
        },
        {
            "code": 6050,
            "name": "AlreadyPaused",
            "msg": "Protocol is already paused"
        },
        {
            "code": 6051,
            "name": "NotPaused",
            "msg": "Protocol is not paused"
        },
        {
            "code": 6052,
            "name": "TooManyProposals",
            "msg": "Too many pending proposals"
        },
        {
            "code": 6053,
            "name": "InvalidAccountState",
            "msg": "Invalid account state"
        },
        {
            "code": 6054,
            "name": "ArithmeticOverflow",
            "msg": "Arithmetic overflow"
        },
        {
            "code": 6055,
            "name": "ArithmeticUnderflow",
            "msg": "Arithmetic underflow"
        },
        {
            "code": 6056,
            "name": "DivisionByZero",
            "msg": "Division by zero"
        },
        {
            "code": 6057,
            "name": "SerializationError",
            "msg": "Serialization error"
        },
        {
            "code": 6058,
            "name": "DeserializationError",
            "msg": "Deserialization error"
        },
        {
            "code": 6059,
            "name": "ClockError",
            "msg": "Failed to read clock"
        },
        {
            "code": 6060,
            "name": "ReconciliationMismatch",
            "msg": "Reconciliation mismatch: vault balance differs from expected"
        },
        {
            "code": 6061,
            "name": "InvalidStateTransition",
            "msg": "Invalid state transition"
        },
        {
            "code": 6062,
            "name": "CpiError",
            "msg": "CPI call failed"
        },
        {
            "code": 6063,
            "name": "JupiterError",
            "msg": "Jupiter swap failed"
        },
        {
            "code": 6064,
            "name": "KaminoError",
            "msg": "Kamino operation failed"
        },
        {
            "code": 6065,
            "name": "TokenProgramError",
            "msg": "Token program error"
        },
        {
            "code": 6066,
            "name": "AtaProgramError",
            "msg": "Associated token program error"
        },
        {
            "code": 6067,
            "name": "SystemProgramError",
            "msg": "System program error"
        },
        {
            "code": 6068,
            "name": "UnexpectedExternalResponse",
            "msg": "Unexpected external program response"
        },
        {
            "code": 6069,
            "name": "InvalidExternalAccount",
            "msg": "Invalid external program account"
        },
        {
            "code": 6070,
            "name": "InvalidJupiterProgram",
            "msg": "Invalid Jupiter program address"
        },
        {
            "code": 6071,
            "name": "InvalidKaminoProgram",
            "msg": "Invalid Kamino program address"
        },
        {
            "code": 6072,
            "name": "MissingKaminoPoolAccount",
            "msg": "Missing Kamino pool account"
        },
        {
            "code": 6073,
            "name": "InvalidJupiterDiscriminator",
            "msg": "Invalid Jupiter instruction discriminator"
        },
        {
            "code": 6074,
            "name": "InvalidKaminoDiscriminator",
            "msg": "Invalid Kamino instruction discriminator"
        },
        {
            "code": 6075,
            "name": "JupiterSwapFailed",
            "msg": "Jupiter swap execution failed"
        },
        {
            "code": 6076,
            "name": "KaminoSwapFailed",
            "msg": "Kamino swap execution failed"
        },
        {
            "code": 6077,
            "name": "DexProgramMismatch",
            "msg": "DEX program mismatch: program does not match route type"
        },
        {
            "code": 6078,
            "name": "VaultPaused",
            "msg": "Vault is paused: operations temporarily suspended for this vault"
        },
        {
            "code": 6079,
            "name": "InvalidTransferDirection",
            "msg": "Invalid transfer direction: funds can only flow Deposit→Main→Withdrawal"
        },
        {
            "code": 6080,
            "name": "InvalidVaultForDeposit",
            "msg": "Invalid vault for deposit: external funds must enter via Deposit vault"
        },
        {
            "code": 6081,
            "name": "InvalidVaultForWithdrawal",
            "msg": "Invalid vault for withdrawal: external funds must exit via Withdrawal vault"
        },
        {
            "code": 6082,
            "name": "InvalidVaultForSwap",
            "msg": "Invalid vault for swap: DEX operations only allowed on Main vault"
        },
        {
            "code": 6083,
            "name": "BalanceMismatch",
            "msg": "Balance mismatch: vault balance does not match audit trail"
        },
        {
            "code": 6084,
            "name": "InvalidSourceVaultKind",
            "msg": "Invalid source vault kind"
        },
        {
            "code": 6085,
            "name": "InvalidDestinationVaultKind",
            "msg": "Invalid destination vault kind"
        },
        {
            "code": 6086,
            "name": "InsufficientVaultBalance",
            "msg": "Transfer amount exceeds vault balance"
        },
        {
            "code": 6087,
            "name": "VaultsNotOperational",
            "msg": "Both source and destination vaults must be operational"
        },
        {
            "code": 6088,
            "name": "VaultAlreadyInitialized",
            "msg": "Vault has already been initialized"
        },
        {
            "code": 6089,
            "name": "VaultsNotInitialized",
            "msg": "All three vaults must be initialized before operations"
        }
    ],
    "types": [
        {
            "name": "CircuitBreakerTrigger",
            "docs": [
                "Circuit breaker trigger reasons"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "VolumeExceeded"
                    },
                    {
                        "name": "ReconciliationMismatch"
                    },
                    {
                        "name": "AnomalyDetected"
                    },
                    {
                        "name": "ManualPause"
                    }
                ]
            }
        },
        {
            "name": "CircuitBreakerTriggered",
            "docs": [
                "Emitted when circuit breaker is triggered"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "trigger",
                        "docs": [
                            "What triggered the circuit breaker"
                        ],
                        "type": {
                            "defined": {
                                "name": "CircuitBreakerTrigger"
                            }
                        }
                    },
                    {
                        "name": "threshold",
                        "docs": [
                            "Relevant threshold that was exceeded"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "actual_value",
                        "docs": [
                            "Actual value that triggered it"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ConfigParameter",
            "docs": [
                "Configuration parameters that can be updated"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "MaxTradeUsd"
                    },
                    {
                        "name": "DailyVolumeCap"
                    },
                    {
                        "name": "MaxSlippageBps"
                    },
                    {
                        "name": "FeeBps"
                    },
                    {
                        "name": "Authority"
                    }
                ]
            }
        },
        {
            "name": "ConfigState",
            "docs": [
                "ConfigState - Risk parameters and whitelist configuration",
                "",
                "This account is the \"brain\" of the protocol's risk management.",
                "Every trade, deposit, and withdrawal is validated against these parameters.",
                "",
                "# Security Considerations",
                "- Authority can only be the governance multisig",
                "- All numeric limits are validated against reasonable bounds",
                "- Whitelist operations are atomic (add/remove one at a time)",
                "- Pause can be instant (emergency), unpause requires timelock",
                "",
                "# Account Size",
                "Variable due to Vec fields, but capped at MAX_ALLOWED_MINTS/ROUTES"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "docs": [
                            "The authority is the governance multisig that can modify the config"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "paused",
                        "docs": [
                            "Whether the protocol is paused (emergency stop)"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "max_trade_usd",
                        "docs": [
                            "The maximum trade size in USD of full contract"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "daily_volume_cap",
                        "docs": [
                            "The daily volume cap in USD"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "daily_volume_used",
                        "docs": [
                            "The daily volume used in USD"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "last_reset_timestamp",
                        "docs": [
                            "The timestamp of the last daily volume reset"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "max_slippage_bps",
                        "docs": [
                            "The maximum slippage in basis points"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "fee_bps",
                        "type": "u16"
                    },
                    {
                        "name": "allowed_mints",
                        "docs": [
                            "The allowed mints"
                        ],
                        "type": {
                            "vec": "pubkey"
                        }
                    },
                    {
                        "name": "allowed_routes",
                        "docs": [
                            "The allowed routes"
                        ],
                        "type": {
                            "vec": "pubkey"
                        }
                    },
                    {
                        "name": "last_updated",
                        "docs": [
                            "The timestamp of the last update"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "bump",
                        "docs": [
                            "The bump for the account"
                        ],
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "ConfigUpdated",
            "docs": [
                "Emitted when configuration is updated"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "parameter",
                        "docs": [
                            "Which parameter was changed"
                        ],
                        "type": {
                            "defined": {
                                "name": "ConfigParameter"
                            }
                        }
                    },
                    {
                        "name": "old_value",
                        "docs": [
                            "Previous value (encoded as bytes for flexibility)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "new_value",
                        "docs": [
                            "New value"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "authority",
                        "docs": [
                            "Who authorized the change"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "DailyVolumeReset",
            "docs": [
                "Emitted when daily volume is reset"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "previous_volume",
                        "docs": [
                            "Previous day's total volume"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint this applies to (or zero for global)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp of reset"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "DepositReceived",
            "docs": [
                "Emitted when funds are deposited into the vault"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "deposit_id",
                        "docs": [
                            "Unique identifier for this deposit"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint that was deposited"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount deposited (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "source",
                        "docs": [
                            "Source account (on-ramp wallet) (Majorly can be the wallet address of circle or other stablecoin provider)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "DepositToMainParams",
            "docs": [
                "Parameters for deposit_to_main instruction"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount",
                        "docs": [
                            "Amount to transfer (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "transfer_id",
                        "docs": [
                            "Unique transfer identifier for tracking"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "FeesCollected",
            "docs": [
                "Emitted when fees are collected to treasury"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint of fees collected"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount collected"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "treasury_total",
                        "docs": [
                            "Running total in treasury"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "FeesWithdrawn",
            "docs": [
                "Emitted when fees are withdrawn from treasury"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "token_mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "type": "u64"
                    },
                    {
                        "name": "destination",
                        "type": "pubkey"
                    },
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "GovernanceActionType",
            "docs": [
                "Types of governance actions"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "UpdateMaxTrade"
                    },
                    {
                        "name": "UpdateDailyCap"
                    },
                    {
                        "name": "UpdateMaxSlippage"
                    },
                    {
                        "name": "UpdateFee"
                    },
                    {
                        "name": "AddMint"
                    },
                    {
                        "name": "RemoveMint"
                    },
                    {
                        "name": "AddRoute"
                    },
                    {
                        "name": "RemoveRoute"
                    },
                    {
                        "name": "Pause"
                    },
                    {
                        "name": "Unpause"
                    },
                    {
                        "name": "TransferAuthority"
                    },
                    {
                        "name": "UpgradeProgram"
                    }
                ]
            }
        },
        {
            "name": "GovernanceProposal",
            "docs": [
                "Governance Proposal - Time locked governance proposal",
                "",
                "Each proposal represents a pending change that must wait for its",
                "timelock to elapse before execution. This provides transparency and",
                "and resposne time for all governance actions.",
                "",
                "LifeCycle :",
                "1) A governance action is created by a governance multisig",
                "2) Event is emitted and it waitsfor timelock period",
                "3) Executed by governance multisig (or anyone after timelock) after timelock period",
                "4) Cannot b e executed twice or after expiry"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "proposal_id",
                        "docs": [
                            "Unique identifier for this proposal"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "action_type",
                        "docs": [
                            "Type of governance action"
                        ],
                        "type": {
                            "defined": {
                                "name": "GovernanceActionType"
                            }
                        }
                    },
                    {
                        "name": "action_data",
                        "docs": [
                            "Serialized action data (varies by action type)",
                            "Format depends on action_type:"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                64
                            ]
                        }
                    },
                    {
                        "name": "data_len",
                        "type": "u8"
                    },
                    {
                        "name": "proposer",
                        "docs": [
                            "Who created the proposal"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "created_at",
                        "docs": [
                            "When the proposal was created"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "execute_after",
                        "docs": [
                            "When the proposal can be executed"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "expires_at",
                        "docs": [
                            "When the proposal expires"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "executed",
                        "docs": [
                            "Whether the proposal has been executed"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "cancelled",
                        "docs": [
                            "Whether the proposal has been cancelled"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "bump",
                        "docs": [
                            "Bump seed for PDA derivation"
                        ],
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "MainToWithdrawalParams",
            "docs": [
                "Parameters for main_to_withdrawal instruction"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount",
                        "docs": [
                            "Amount to transfer (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "transfer_id",
                        "docs": [
                            "Unique transfer identifier for tracking"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "MintDelisted",
            "docs": [
                "Emitted when a token mint is removed from whitelist"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "MintWhitelisted",
            "docs": [
                "Emitted when a token mint is added to whitelist"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "PauseVaultParams",
            "docs": [
                "Parameters for pause_vault instruction"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "vault_kind",
                        "docs": [
                            "Which vault to pause"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKind"
                            }
                        }
                    },
                    {
                        "name": "reason",
                        "docs": [
                            "Reason for pause (for audit trail)"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "ProposalCancelled",
            "docs": [
                "Emitted when a governance proposal is cancelled"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "proposal_id",
                        "type": "u64"
                    },
                    {
                        "name": "canceller",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ProposalCounter",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "next_id",
                        "docs": [
                            "Next proposal ID to use"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "docs": [
                            "Bump seed"
                        ],
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "ProposalCreated",
            "docs": [
                "Emitted when a governance proposal is created"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "proposal_id",
                        "docs": [
                            "Unique proposal identifier"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "action_type",
                        "docs": [
                            "Type of action being proposed"
                        ],
                        "type": {
                            "defined": {
                                "name": "GovernanceActionType"
                            }
                        }
                    },
                    {
                        "name": "proposer",
                        "docs": [
                            "Who created the proposal"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "execute_after",
                        "docs": [
                            "When the proposal can be executed (timelock)"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "created_at",
                        "docs": [
                            "Creation timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ProposalExecuted",
            "docs": [
                "Emitted when a governance proposal is executed"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "proposal_id",
                        "type": "u64"
                    },
                    {
                        "name": "action_type",
                        "type": {
                            "defined": {
                                "name": "GovernanceActionType"
                            }
                        }
                    },
                    {
                        "name": "executor",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ProtocolInitialized",
            "docs": [
                "Emitted when the protocol is initialized"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "docs": [
                            "Governance authority address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "vault",
                        "docs": [
                            "Vault PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "config",
                        "docs": [
                            "Config PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "treasury",
                        "docs": [
                            "Treasury PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "max_trade_usd",
                        "docs": [
                            "Initial max trade limit"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "daily_volume_cap",
                        "docs": [
                            "Initial daily volume cap"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "fee_bps",
                        "docs": [
                            "Initial fee in basis points"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ProtocolPaused",
            "docs": [
                "Emitted when the protocol is paused"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "docs": [
                            "Who initiated the pause"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "reason",
                        "docs": [
                            "Reason for pause (optional, capped length)"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "ProtocolUnpaused",
            "docs": [
                "Emitted when the protocol is unpaused"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "RouteDelisted",
            "docs": [
                "Emitted when a DEX route is removed from whitelist"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "route_program",
                        "type": "pubkey"
                    },
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "RouteType",
            "docs": [
                "Type of DEX route used for swaps"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Jupiter"
                    },
                    {
                        "name": "Kamino"
                    },
                    {
                        "name": "Direct"
                    }
                ]
            }
        },
        {
            "name": "RouteWhitelisted",
            "docs": [
                "Emitted when a DEX route is added to whitelist"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "route_program",
                        "type": "pubkey"
                    },
                    {
                        "name": "route_type",
                        "type": {
                            "defined": {
                                "name": "RouteType"
                            }
                        }
                    },
                    {
                        "name": "authority",
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "SwapExecuted",
            "docs": [
                "Emitted when a swap is successfully executed",
                "This is the primary event for trade tracking and reconciliation"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "user_id",
                        "docs": [
                            "Unique identifier linking to off-chain user record",
                            "This is NOT a Solana address."
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "input_mint",
                        "docs": [
                            "Input token mint address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "output_mint",
                        "docs": [
                            "Output token mint address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "input_amount",
                        "docs": [
                            "Amount of input tokens (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "output_amount",
                        "docs": [
                            "Amount of output tokens received (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "min_output",
                        "docs": [
                            "Minimum output that was specified (slippage protection)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "fee_amount",
                        "docs": [
                            "Platform fee collected (in input token decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "route_used",
                        "docs": [
                            "Which DEX route was used (jupiter/kamino)"
                        ],
                        "type": {
                            "defined": {
                                "name": "RouteType"
                            }
                        }
                    },
                    {
                        "name": "effective_price",
                        "docs": [
                            "Effective price (output/input scaled to common decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp of execution"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "slot",
                        "docs": [
                            "Solana slot number for ordering"
                        ],
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "SwapFailed",
            "docs": [
                "Emitted when a swap fails after initial validation",
                "Used for debugging and monitoring failure rates"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "user_id",
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "input_mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "output_mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "input_amount",
                        "type": "u64"
                    },
                    {
                        "name": "error_code",
                        "type": "u32"
                    },
                    {
                        "name": "timestamp",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "SwapParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount_in",
                        "type": "u64"
                    },
                    {
                        "name": "amount_usd",
                        "type": "u64"
                    },
                    {
                        "name": "min_amount_out",
                        "type": "u64"
                    },
                    {
                        "name": "expected_output",
                        "type": {
                            "option": "u64"
                        }
                    },
                    {
                        "name": "slippage_bps",
                        "type": "u16"
                    },
                    {
                        "name": "user_id",
                        "docs": [
                            "User ID hash (for event correlation, not a Solana address)"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "route_type",
                        "type": {
                            "defined": {
                                "name": "SwapRouteType"
                            }
                        }
                    },
                    {
                        "name": "data",
                        "docs": [
                            "Serialized route data for the DEX",
                            "This contains the Jupiter/Kamino-specific instruction data",
                            "Format depends on route_type:",
                            "- Jupiter: JupiterRouteInfo serialized",
                            "- Kamino: KaminoRouteInfo serialized"
                        ],
                        "type": "bytes"
                    }
                ]
            }
        },
        {
            "name": "SwapRouteType",
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Jupiter"
                    }
                ]
            }
        },
        {
            "name": "ThreeVaultsInitialized",
            "docs": [
                "Emitted when all three vaults are initialized"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "deposit_vault",
                        "docs": [
                            "Deposit vault PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "main_vault",
                        "docs": [
                            "Main vault PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "withdrawal_vault",
                        "docs": [
                            "Withdrawal vault PDA address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "authority",
                        "docs": [
                            "Governance authority address"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "TreasuryState",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "total_fees_collected",
                        "docs": [
                            "Total fees collected in lamports"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "total_volume",
                        "docs": [
                            "Total trade volume in lamports"
                        ],
                        "type": "u128"
                    },
                    {
                        "name": "last_collection_timestamp",
                        "docs": [
                            "Timestamp of last fee collection"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "total_trades",
                        "docs": [
                            "Total number of trades recorded"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "bump",
                        "docs": [
                            "Bump seed used to derive this PDA",
                            "Stored to avoid recomputation on every transaction",
                            "",
                            "SECURITY: This is set once during initialization and never changes"
                        ],
                        "type": "u8"
                    }
                ]
            }
        },
        {
            "name": "UserToDepositParams",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount",
                        "docs": [
                            "Amount to deposit (in token's native decimals)",
                            "For USDC, this is in micro-dollars (6 decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "deposit_id",
                        "docs": [
                            "Unique deposit identifier for tracking and idempotency",
                            "Typically generated by the backend"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "UserToVaultDeposit",
            "docs": [
                "Emitted when funds flow from user to deposit vault (external inbound)"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "deposit_id",
                        "docs": [
                            "Unique deposit identifier"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint deposited"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount deposited"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "source",
                        "docs": [
                            "Source address (user's on-ramp wallet)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "vault_total_in",
                        "docs": [
                            "Deposit vault's total_in after this deposit"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VaultKind",
            "docs": [
                "VaultKind - Discriminates between the three vault types",
                "",
                "This enum is stored on-chain in each VaultState account to enforce",
                "that the correct vault is used for each operation. The program validates",
                "vault kind before executing any transfer.",
                "",
                "# Security",
                "- Prevents deposit instruction from targeting withdrawal vault",
                "- Enables instruction-level validation of vault intent",
                "- Immutable after initialization (set once, never changes)"
            ],
            "repr": {
                "kind": "rust"
            },
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Deposit"
                    },
                    {
                        "name": "Main"
                    },
                    {
                        "name": "Withdrawal"
                    }
                ]
            }
        },
        {
            "name": "VaultKindEvent",
            "docs": [
                "Vault kind for use in events (mirrors state::VaultKind)",
                "Separate enum to avoid circular dependency with state module"
            ],
            "type": {
                "kind": "enum",
                "variants": [
                    {
                        "name": "Deposit"
                    },
                    {
                        "name": "Main"
                    },
                    {
                        "name": "Withdrawal"
                    }
                ]
            }
        },
        {
            "name": "VaultPaused",
            "docs": [
                "Emitted when a specific vault is paused (per-vault circuit breaker)"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "vault_kind",
                        "docs": [
                            "Which vault was paused"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKindEvent"
                            }
                        }
                    },
                    {
                        "name": "authority",
                        "docs": [
                            "Who initiated the pause"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "reason",
                        "docs": [
                            "Reason for pause (optional, capped length)"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VaultReconciliation",
            "docs": [
                "Emitted during reconciliation to report vault state"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "vault_kind",
                        "docs": [
                            "Which vault was reconciled"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKindEvent"
                            }
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint reconciled"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "expected_balance",
                        "docs": [
                            "Expected balance (total_in - total_out)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "actual_balance",
                        "docs": [
                            "Actual ATA balance"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "is_balanced",
                        "docs": [
                            "Whether balances match"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VaultState",
            "docs": [
                "VaultState - PDA account representing one of the three custody vaults",
                "",
                "Each vault maintains its own state including:",
                "- Circuit breaker (pause) capability",
                "- Cumulative in/out tracking for audit trail",
                "- Timestamp of last activity",
                "",
                "# Account Size",
                "Total: 8 (discriminator) + 1 (bump) + 8 (initialized_at) + 1 (kind) +",
                "1 (paused) + 8 (total_in) + 8 (total_out) + 8 (last_transfer_at) +",
                "21 (padding) = 64 bytes",
                "",
                "# Security Considerations",
                "- bump stored to save compute on subsequent transactions",
                "- kind is immutable after initialization",
                "- paused provides per-vault circuit breaker",
                "- total_in/out form immutable audit trail (monotonically increasing)"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "bump",
                        "docs": [
                            "Bump seed used to derive this PDA",
                            "Stored to avoid recomputation on every transaction",
                            "",
                            "SECURITY: This is set once during initialization and never changes"
                        ],
                        "type": "u8"
                    },
                    {
                        "name": "initialized_at",
                        "docs": [
                            "Unix timestamp when the vault was initialized",
                            "Used for auditing and cannot be modified after initialization"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "kind",
                        "docs": [
                            "Type of vault (Deposit, Main, or Withdrawal)",
                            "",
                            "SECURITY: Set once during initialization, never changes",
                            "Used for on-chain validation of allowed operations"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKind"
                            }
                        }
                    },
                    {
                        "name": "paused",
                        "docs": [
                            "Circuit breaker - pauses all operations on this specific vault",
                            "",
                            "SECURITY: Can be set by governance for emergency response",
                            "Each vault can be paused independently"
                        ],
                        "type": "bool"
                    },
                    {
                        "name": "total_in",
                        "docs": [
                            "Cumulative total of all funds received by this vault",
                            "",
                            "AUDIT: Monotonically increasing, never decreases",
                            "Used for reconciliation: balance = total_in - total_out"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "total_out",
                        "docs": [
                            "Cumulative total of all funds sent from this vault",
                            "",
                            "AUDIT: Monotonically increasing, never decreases",
                            "Used for reconciliation: balance = total_in - total_out"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "last_transfer_at",
                        "docs": [
                            "Unix timestamp of last transfer (in or out)",
                            "",
                            "AUDIT: Used for activity monitoring and anomaly detection"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VaultToUserWithdrawal",
            "docs": [
                "Emitted when funds flow from withdrawal vault to user (external outbound)"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "withdrawal_id",
                        "docs": [
                            "Unique withdrawal identifier"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint withdrawn"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount withdrawn"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "destination",
                        "docs": [
                            "Destination address (user's off-ramp wallet)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "vault_total_out",
                        "docs": [
                            "Withdrawal vault's total_out after this withdrawal"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VaultTransfer",
            "docs": [
                "Emitted when funds transfer between vaults (inter-vault transfer)",
                "This is the core audit event for the three-vault architecture"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "transfer_id",
                        "docs": [
                            "Unique identifier for this transfer (for idempotency and tracking)"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "from_vault",
                        "docs": [
                            "Source vault type"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKindEvent"
                            }
                        }
                    },
                    {
                        "name": "to_vault",
                        "docs": [
                            "Destination vault type"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKindEvent"
                            }
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint that was transferred"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount transferred (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "source_total_out",
                        "docs": [
                            "Source vault total_out after this transfer"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "dest_total_in",
                        "docs": [
                            "Destination vault total_in after this transfer"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "initiator",
                        "docs": [
                            "Who initiated the transfer (governance/backend authority)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    },
                    {
                        "name": "slot",
                        "docs": [
                            "Solana slot for ordering"
                        ],
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "VaultUnpaused",
            "docs": [
                "Emitted when a specific vault is unpaused"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "vault_kind",
                        "docs": [
                            "Which vault was unpaused"
                        ],
                        "type": {
                            "defined": {
                                "name": "VaultKindEvent"
                            }
                        }
                    },
                    {
                        "name": "authority",
                        "docs": [
                            "Who initiated the unpause"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "VolumeWarning",
            "docs": [
                "Emitted when daily volume approaches cap (warning)"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "current_volume",
                        "docs": [
                            "Current volume"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "daily_cap",
                        "docs": [
                            "Daily cap"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "utilization_bps",
                        "docs": [
                            "Percentage used (basis points, e.g., 8000 = 80%)"
                        ],
                        "type": "u16"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "WithdrawalProcessed",
            "docs": [
                "Emitted when funds are withdrawn from the vault"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "withdrawal_id",
                        "docs": [
                            "Unique identifier for this withdrawal"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    },
                    {
                        "name": "token_mint",
                        "docs": [
                            "Token mint that was withdrawn"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "amount",
                        "docs": [
                            "Amount withdrawn (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "destination",
                        "docs": [
                            "Destination account (off-ramp wallet) (Majorly can be the wallet address of circle or other stablecoin provider)"
                        ],
                        "type": "pubkey"
                    },
                    {
                        "name": "timestamp",
                        "docs": [
                            "Unix timestamp"
                        ],
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "WithdrawalToUserParams",
            "docs": [
                "Parameters for withdrawal_to_user instruction",
                "# Arguments",
                "* `amount` - The amount to withdraw (in token's native decimals)",
                "* `withdrawal_id` - The unique withdrawal identifier for tracking and idempotency"
            ],
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "amount",
                        "docs": [
                            "Amount to withdraw (in token's native decimals)"
                        ],
                        "type": "u64"
                    },
                    {
                        "name": "withdrawal_id",
                        "docs": [
                            "Unique withdrawal identifier for tracking and idempotency"
                        ],
                        "type": {
                            "array": [
                                "u8",
                                32
                            ]
                        }
                    }
                ]
            }
        }
    ]
};

// Get program ID as PublicKey
export function getProgramId(): string {
    return PROGRAM_ID;
}
