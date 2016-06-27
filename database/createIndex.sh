#!/usr/bin/env bash

if [ $# != 3 ]; then
	echo "Usage: ./createIndex.sh <elasticsearch_host_ip> <elasticsearch_port> <name_of_index>"
	exit -1
fi

curl -XPUT    "$1:$2/$3" -d'
{
    "settings": {
        "number_of_replicas": 0,
        "number_of_shards": 5,
        "analysis": {
            "analyzer": {
                "uc_analyzer": {
                    "type": "custom",
                    "tokenizer": "whitespace",
                    "filter": [
                        "lowercase",
                        "pattern_a_filter",
                        "pattern_d_filter",
                        "pattern_e_filter",
                        "pattern_i_filter",
                        "pattern_o_filter",
                        "pattern_u_filter",
                        "pattern_y_filter",
                        "pattern_th_filter",
                        "pattern_ae_filter",
                        "pattern_oo_filter",
                        "pattern_uu_filter",
                        "pattern_aa_filter",
                        "pattern_ao_filter",
                        "pattern_ss_filter",
                        "pattern_tildan_filter",
						"pattern_norskaoo_filter"
                    ],
                    "char_filter": [
                        "my_pattern"
                    ]
                },
				"card_analyzer": {
					"type": "custom",
					"tokenizer": "whitespace",
					"filter": [
						"pattern_star_filter"
					]
				}
            },
            "char_filter": {
                "my_pattern": {
                    "type": "pattern_replace",
                    "pattern": " ",
                    "replacement": ""
                }
            },
            "filter": {
                "pattern_a_filter": {
                    "type": "pattern_replace",
                    "pattern": "á",
                    "replacement": "az"
                },
                "pattern_d_filter": {
                    "type": "pattern_replace",
                    "pattern": "ð",
                    "replacement": "dz"
                },
                "pattern_e_filter": {
                    "type": "pattern_replace",
                    "pattern": "é",
                    "replacement": "ez"
                },
                "pattern_i_filter": {
                    "type": "pattern_replace",
                    "pattern": "í",
                    "replacement": "iz"
                },
                "pattern_o_filter": {
                    "type": "pattern_replace",
                    "pattern": "ó",
                    "replacement": "oz"
                },
                "pattern_u_filter": {
                    "type": "pattern_replace",
                    "pattern": "ú",
                    "replacement": "uz"
                },
                "pattern_y_filter": {
                    "type": "pattern_replace",
                    "pattern": "ý",
                    "replacement": "yz"
                },
                "pattern_th_filter": {
                    "type": "pattern_replace",
                    "pattern": "þ",
                    "replacement": "zz1"
                },
                "pattern_ae_filter": {
                    "type": "pattern_replace",
                    "pattern": "æ",
                    "replacement": "zz2"
                },
                "pattern_oo_filter": {
                    "type": "pattern_replace",
                    "pattern": "ö",
                    "replacement": "zz3"
                },
                "pattern_uu_filter": {
                    "type": "pattern_replace",
                    "pattern": "ü",
                    "replacement": "uz1"
                },
                "pattern_aa_filter": {
                    "type": "pattern_replace",
                    "pattern": "ä",
                    "replacement": "az1"
                },
                "pattern_ao_filter": {
                    "type": "pattern_replace",
                    "pattern": "å",
                    "replacement": "az2"
                },
                "pattern_ss_filter": {
                    "type": "pattern_replace",
                    "pattern": "ß",
                    "replacement": "sz"
                },
                "pattern_tildan_filter": {
                    "type": "pattern_replace",
                    "pattern": "ñ",
                    "replacement": "nz"
                },
				"pattern_norskaoo_filter" : {
					"type" : "pattern_replace",
					"pattern" : "ø",
					"replacement" : "zz3"
				},
				"pattern_star_filter" : {
				  "type" : "pattern_replace",
				  "pattern" : "\\*",
				  "replacement" : "0"
				}
            }
        }
    },
    "mappings": {
        "doc": {
            "properties": {
            	"Date": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "AffairID": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "DepartmentID": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "FinanceKeyID": {
                    "type": "integer"
                },
                "Amount": {
                    "type": "long"
                },
                "FinanceKey": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "PrimaryFinanceKey": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "SecondaryFinanceKey": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "Department": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "Affair": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "Creditor": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "CreditorID": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "DepartmentGroup": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "AffairGroup": {
                    "type": "string",
                    "index": "not_analyzed"
                }
            }
        }
    }
}'
