// Create express app
let express = require('express');
let app = express();
let db = require('./db');
let format = require('date-fns/format');
let addHours = require('date-fns/addHours');
let setMinutes = require('date-fns/setMinutes');
let subDays = require('date-fns/subDays');
let addDays = require('date-fns/addDays');

// Server port
let HTTP_PORT = 8000;

//Middleware
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  );
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
  next();
});

// Start server
app.listen(HTTP_PORT, () => {
  console.log(
    `Server running on port - ${HTTP_PORT} since ${format(
      new Date(),
      'dd-MM-yyyy hh:mm:ss'
    )}`
  );
});
// Root endpoint
app.get('/', (req, res, next) => {
  let currDate = format(new Date(), 'dd-MM-yyyy hh:mm:ss');
  res.json({ message: 'SQLite API running!!!', date: currDate });
});

// Insert here other API endpoints
app.get('/api/GetMachineInfo', (req, res, next) => {
  let sql = 'select * from machine_info';
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).send(`Error Occured ${err}`);
    } else {
      res.send(rows);
    }
  });
});

app.get('/api/GetUPH', (req, res, next) => {
  let currentHour = new Date();
  currentHour = setMinutes(currentHour, 1).setSeconds(0);
  let nextHour = addHours(currentHour, 1).setMinutes(0);
  currentHour = format(new Date(currentHour), 'yyyy-MM-dd HH:mm:ss');
  nextHour = format(new Date(nextHour), 'yyyy-MM-dd HH:mm:ss');

  let sql = `select a.MachineName,a.id,count(*) as [Count] from Machine_Info as a   
  left outer join process_result as b on a.id = b.machineid 
  and b.endtime between '${currentHour}' and '${nextHour}' group by a.MachineName,a.id`;
  console.log(sql);
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).send(`Error Occured ${err}`);
    } else {
      res.send(rows);
    }
  });
});
app.get('/api/GetFullDay/:startDate/:endDate', (req, res, next) => {
  let startDate = req.params.startDate;
  let endDate = req.params.endDate;
  let currentDay = new Date();
  let nextDay = addDays(currentDay, 1);
  currentDay = format(currentDay, 'yyyy-MM-dd');
  nextDay = format(new Date(nextDay), 'yyyy-MM-dd');
  let sql = `select a.MachineName,a.id,count(*) as [Count] from Machine_Info as a   
  left outer join process_result as b on a.id = b.machineid 
  and b.processdate between '${startDate}' and '${endDate}' group by a.MachineName,a.id`;
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).send(`Error Occured ${err}`);
    } else {
      res.send(rows);
    }
  });
});
app.get('/api/GetPrevDay/:startDate/:endDate', (req, res, next) => {
  let startDate = req.params.startDate;
  let endDate = req.params.endDate;
  let currentDay = new Date();
  let prevDay = subDays(currentDay, 1);
  let prev2Day = subDays(currentDay, 2);
  prev2Day = format(new Date(prev2Day), 'yyyy-MM-dd');
  prevDay = format(new Date(prevDay), 'yyyy-MM-dd');
  let sql = `select a.MachineName,a.id,count(*) as [Count] from Machine_Info as a   
  left outer join process_result as b on a.id = b.machineid 
  and b.processdate between '${startDate}' and '${endDate}' group by a.MachineName,a.id`;
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).send(`Error Occured ${err}`);
    } else {
      res.send(rows);
    }
  });
});

app.get(
  '/api/GetMachineStatus/:machineID/:startDate/:endDate',
  (req, res, next) => {
    let machineID = req.params.machineID;
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;
    let currentDay = new Date();
    let prevDay = subDays(currentDay, 1);
    currentDay = format(currentDay, 'yyyy-MM-dd');
    prevDay = format(new Date(prevDay), 'yyyy-MM-dd');
    let sql = `select a.MachineName,a.ID,b.status,b.statusdatetime from Machine_Info as a   
  inner join machine_status as b on a.id = b.machineid 
  and b.statusdatetime between '${startDate}' and '${endDate}' and b.machineid=${machineID}`;
    let params = [];
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).send(`Error Occured ${err}`);
      } else {
        res.send(rows);
      }
    });
  }
);
app.get('/api/GetTotalParts/:machineID/:startDate/:endDate', (req, res) => {
  let machineID = req.params.machineID;
  let startDate = req.params.startDate;
  let endDate = req.params.endDate;
  let params = [];
  let sql = `select  machineID,ProcessDate,status,count(*) as Total from process_result 
   where machineId = ${machineID} and processdate between '${startDate}' and '${endDate}' 
   group by ProcessDate,status,machineID`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).send(`Error Occured ${err}`);
    } else {
      res.send(rows);
    }
  });
});
app.get('*', function(req, res) {
  res.send('Sorry, this is an invalid URL.');
});
