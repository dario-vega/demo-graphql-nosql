'use strict';

const NoSQLClient = require('oracle-nosqldb').NoSQLClient;
const Region = require('oracle-nosqldb').Region;
const ServiceType = require('oracle-nosqldb').ServiceType;

// Target table used by this example
const TABLE_NAME = 'blogtable';
const USAGE = 'Usage: node quickstart.js cloud|cloudsim|kvstore';

async function quickstart() {
    let client;
    try {
        const args = process.argv;
        let serviceType = 'cloud';
        // Set up access to the cloud service
        client = createClient(serviceType);
        console.log('Created NoSQLClient instance');
        await run(client);
        console.log('Success!');
    } catch (err) {
        console.error('  Error: ' + err.message);
        console.error('  from: ');
        console.error(err.operation.api.name);
    } finally {
        if (client) {
            client.close();
        }
    }
}

/*
 * This function encapsulates environmental differences and returns a
 * client handle to use for data operations.
 */
function createClient(serviceType) {

        return new NoSQLClient({
            region: Region.EU_FRANKFURT_1,
			compartment:'ocid1.compartment.oc1..aaaaaaaamgvdxnuap56pu2qqxrcg7qnvb4wxenqguylymndvey3hsyi57paa',
            auth: {
                iam: {
                    tenantId: 'ocid1.tenancy.oc1..aaaaaaaahrs4avamaxiscouyeoirc7hz5byvumwyvjedslpsdb2d2xe2kp2q',
                    userId: 'ocid1.user.oc1..aaaaaaaaqeq7zdo54v524lk5k2cxbnrowyp7p5f36r2s5co3ssybmexcu4ba',
                    fingerprint: 'e1:4f:7f:e7:b5:7c:11:38:ed:e5:9f:6d:92:bb:ae:3d',
                    privateKeyFile: 'NoSQLprivateKey.pem'
                }
            }
        });
}

/*
 * Create a table, read and write a record
 */
async function run(client) {

let lim = 5;
try {
  const TABLE_NAME = 'blogtable';
  let statement = `SELECT * FROM ${TABLE_NAME} LIMIT ${lim}`;

  let cnt;
  let res;
  do {
       res = await client.query(statement ,  { continuationKey:cnt});
       for(let row of res.rows) {
           console.log(row);
       }
       console.log('  Read used: %O', res.consumedCapacity);
       cnt = res.continuationKey;
  } while(res.continuationKey != null);
}
catch (e) {
  console.log(e);
}
finally {
  console.log("entering and leaving the finally block");
}

}

quickstart();
