/*
 *
 * To run:
 *  1. Edit for your target environment and credentials
 *  2. Run it:
 *       node load.js cloud|cloudsim|kvstore
 *
 *  Use 'cloud' for the Oracle NoSQL Database Cloud Service
 *  Use 'cloudsim' for the Oracle NoSQL Cloud Simulator
 *  Use 'kvstore' for the Oracle NoSQL Database on-premise
 */
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
        let serviceType = args[2];
        if (!serviceType) {
            return console.error(USAGE);
        }
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

    switch(serviceType) {
    case 'cloud':
        return new NoSQLClient({
            /*
             * EDIT:
             * 1. use desired region id
             * 2. your tenancy's OCID, user's OCID
             * 3. privateKeyFile path
             * 4. fingerprint for uploaded public key
             * 5. optional passphrase. If your key has none, delete this
             * line (and the leading ',').
             */
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
    case 'cloudsim':
        /*
         * EDIT: if the endpoint does not reflect how the Cloud
         * Simulator has been started, modify it accordingly.
         */
        return new NoSQLClient({
            serviceType: ServiceType.CLOUDSIM,
            endpoint: 'localhost:8080'
        });
    case 'kvstore':
        /*
         * EDIT: if the endpoint does not reflect how the Proxy
         * Server has been started, modify it accordingly.
         */
        return new NoSQLClient({
            serviceType: ServiceType.KVSTORE,
            endpoint: 'localhost:8080'
        });
    default:
        throw new Error('Unknown service type: ' + serviceType);
    }
}

/*
 * Create a table, read and write a record
 */
async function run(client) {


try {
  const createDDL = `CREATE TABLE IF NOT EXISTS blogtable \
     (id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1 NO CYCLE), blog STRING, PRIMARY KEY (id))`;
  console.log('Create table ' + TABLE_NAME);
  let resTab = await client.tableDDL(createDDL, {
      tableLimits: {
          readUnits: 20,
          writeUnits: 20,
          storageGB: 1
      }
  });
  await client.forCompletion(resTab);
  console.log('  Creating table %s', resTab.tableName);
  console.log('  Table state: %s', resTab.tableState.name);
	
  let res =null;
  var i;
  for (i = 0; i < 1000; i++) {
    res = await client.put(TABLE_NAME, {
//        id : i,
        blog: 'Creating an empty blog tagged #' + i
    });
  }
}
catch (e) {
  console.log(e);
}
finally {
  console.log("entering and leaving the finally block");
}

}

quickstart();
