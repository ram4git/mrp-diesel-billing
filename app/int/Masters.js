const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron').remote;
const dbPath = path.resolve(app.getPath('userData'), 'dieseldata.db');
//C:\Users\IEUser\AppData\Roaming\mrp-waybridge-billing
const db = new sqlite3.Database(dbPath);

export function addBill(bill) {
  console.log("DB PATH=" + dbPath);
  let valuesArray = [];
  valuesArray.push(bill.sno);// #2 sno
  valuesArray.push(bill.date);// #1 date
  valuesArray.push(bill.vehicleNo);// #2 action
  valuesArray.push(bill.vehicleType);// #3 product
  valuesArray.push(bill.driverName);// #4 region
  valuesArray.push(bill.meterReading.toFixed(2));// #5 lorryType
  valuesArray.push(bill.remainingFuel.toFixed(2));// #6 totalWeightInTons
  valuesArray.push(bill.dieselIssued.toFixed(2));// #7 activityRows
  valuesArray.push(bill.odometerReading.toFixed(2));// #8  totalAmout
  valuesArray.push(bill.remarks); //#9 jattuAmount
  valuesArray.push(bill.areKeysIssued); //#10 balanceAmount
  valuesArray.push(bill.billEnteredBy); //#11 chargePerTon
  valuesArray.push(bill.screenshot); //#11 chargePerTon


  return new Promise((resolve, reject) => {
    const stmt = 'INSERT INTO BILLS (sno, date, vehicleNo, vehicleType, driverName,' +
    ' meterReading, remainingFuel, dieselIssued, odometerReading, remarks,' +
    ' areKeysIssued, billEnteredBy, screenshot) ' +
    'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
    db.run(stmt, valuesArray, (err) => {
      if (!err) {
        resolve({ success: true, id: bill.sno });
      } else {
        reject(err);
      }
    });
  });
}

export function getBills() {

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM BILLS ORDER BY sno DESC LIMIT 100', (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}

export function getBillsForShift(start, end) {

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM BILLS WHERE date >= ? AND date < ? ORDER BY sno DESC LIMIT 100', [start, end], (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}

export function getBillsForVehicle(start, end, vehicleNo) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM BILLS WHERE date >= ? AND date < ? AND vehicleNo == ? ORDER BY sno DESC LIMIT 100', [start, end, vehicleNo], (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}


export function getBill(billNo) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM BILLS where sno = ?', billNo, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}


export function getMasters() {

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM MASTERS', (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}

export function addMasterValue(masterKey, masterValue) {
  const goodMasterKey = masterValue.split(' ').join('_');
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = 'INSERT INTO MASTERS (name, key, value) VALUES (?,?,?)';
      console.log('STMT=' + stmt);
      db.run(stmt, [masterKey, goodMasterKey, masterValue], (err) => {
        if (!err) {
          resolve({ success: true });
        } else {
          reject(err);
        }
      });
    });
  });
}


export function getUser(name) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.all('SELECT * FROM USERS where name = ?', name, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  });
}

export function addUser(name, pass) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const stmt = 'INSERT INTO USERS (name, pass) VALUES (?,?)';
      db.run(stmt, [name, pass], (err) => {
        if (!err) {
          resolve({ success: true });
        } else {
          reject(err);
        }
      });
    });
  });
}
