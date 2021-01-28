var touchstone = 2;

var state = {
  NONE:0,
  INSTRUCTIONS: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
};
var test;
var ctx = {
  w: 800,
  h: 600,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  participantIndex:touchstone == 1 ? "Participant" : "ParticipantID",
  practiceIndex:"Practice",
  blockIndex: (touchstone == 1 ? "Block" : "Block1"),
  trialIndex: (touchstone == 1 ? "Trial" : "TrialID"),
  vvIndex:"VV",
  objectsCountIndex:"OC",

  state:state.NONE,
  targetIndex:0,

  // TODO log measures
  // loggedTrials is a 2-dimensional array where we store our log file
  // where one line is one trial
  loggedTrials:
    touchstone == 1 ?
    [["Participant","Practice","Block","Trial","VV","OC","visualSearchTime","ErrorCount"]] :
    [["DesignName","ParticipantID","TrialID","Block1","Trial","VV","OC","visualSearchTime","ErrorCount"]],
  
  startTime: 0,
  endTime: 0,
  visualSearchTime: 0,
  errorCount: 0
};

var gridLength = 56;

/****************************************/
/********** LOAD CSV DESIGN FILE ********/
/****************************************/

var loadData = function(svgEl){
  // d3.csv parses a csv file...
  d3.csv("experiment_touchstone"+touchstone+".csv").then(function(data){
    // ... and turns it into a 2-dimensional array where each line is an array indexed by the column headers
    // for example, data[2]["OC"] returns the value of OC in the 3rd line
    ctx.trials = data;
    // all trials for the whole experiment are stored in global variable ctx.trials

    var participant = "";
    var options = [];

    for(var i = 0; i < ctx.trials.length; i++) {
      if(!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
    select.selectAll("option")
      .data(options)
      .enter()
      .append("option")
      .text(function (d) { return d; });

    setParticipant(options[0]);

  }).catch(function(error){console.log(error)});
};

/****************************************/
/************* RUN EXPERIMENT ***********/
/****************************************/


var startExperiment = function(event) {
  event.preventDefault();

  // set the trial counter to the first trial to run
  // ctx.participant, ctx.startBlock and ctx.startTrial contain values selected in combo boxes

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock
               && (touchstone == 2 || ctx.trials[i][ctx.practiceIndex] === "false")) {
        if(parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i - 1;

          if(touchstone == 1) { // include practice trials before this trial for TouchStone 1
            while(ctx.cpt >= 0 && ctx.trials[ctx.cpt][ctx.practiceIndex] === "true") {
              ctx.cpt = ctx.cpt-1;
            }
          }

          // start first trial
          console.log("start experiment at "+ctx.cpt);
          nextTrial();
          return;
        }
      }
    }
  }

}

var nextTrial = function() {
  ctx.cpt++;
  displayInstructions();
}

var displayInstructions = function() {
  ctx.state = state.INSTRUCTIONS;

  d3.select("#instr")
    .append("div")
    .attr("id", "instructions")
    .classed("instr", true);

  d3.select("#instructions")
    .append("p")
    .html("Multiple shapes will get displayed.<br> Only <b>one shape</b> is different from all other shapes.");

  d3.select("#instructions")
    .append("p")
    .html("1. Spot it as fast as possible and press <code>Space</code> bar;");

  d3.select("#instructions")
    .append("p")
    .html("2. Click on the placeholder over that shape.");

  d3.select("#instructions")
    .append("p")
    .html("Press <code>Enter</code> key when ready to start.");

}

var convertSign = function(num){
  return -Number(num);
}

// min (included), max (excluded)
var getRandomInt = function(min,max){
  return Math.floor(Math.random() * (max - min) ) + min;
}

var displayShapes = function() {
  console.log(ctx.trials[ctx.cpt]["TrialID"])
  ctx.state = state.SHAPES;

  var visualVariable = ctx.trials[ctx.cpt]["VV"];
  var oc = ctx.trials[ctx.cpt]["OC"];
  if(oc === "Small") {
    objectCount = 9;
  } else if(oc === "Medium") {
    objectCount = 25;
  } else {
    objectCount = 49;
  }
  console.log("display shapes for condition "+oc+","+visualVariable);

  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
  .attr("id", "shapes")
  .attr("transform", "translate(100,100)");

  // 1. Decide on the visual appearance of the target
  // In my example, it means deciding on its size (large or small) and its color (light or dark)
  var randomNumber1 = Math.random();
  var randomNumber2 = Math.random();
  
  var parallel = 0;
  var nonParallel = 10;
  //var directionBase = getRandomInt(0,360);
  var directionBase = 0;
  var directionRotate = directionBase + 45;
  //var targetParallelism, targetDirection
  //Define the value
  var targetP, targetD; 
  if(randomNumber1 > 0.5) {
    targetP = parallel; // target is parallel
    console.log("targetP: " + targetP);
  } else {
    targetP = nonParallel; // target is not parallel
    console.log("targetP: " + targetP);
  }
  if(randomNumber2 > 0.5) {
    targetD = directionBase; // target direction
    console.log("targetD: " + targetD);
  } else {
    targetD = directionRotate; // target direction and rotate 45 degree more
    console.log("targetD: " + targetD);
  }

  // 2. Set the visual appearance of all other objects now that the target appearance is decided
  // Here, we implement the case VV = "Size" so all other objects are large (resp. small) if target is small (resp. large) but have the same color as target.
  var objectsAppearance = [];

  for (var i = 0; i < objectCount-1; i++){
    // ADDED Step 2-a
    if (visualVariable === "Parallelism"){
      if(targetP === parallel) {
        objectsAppearance.push({
          angel: parallel,
          direction: targetD // constant
        });
      } else {
        objectsAppearance.push({
          angel: nonParallel,
          direction: targetD // constant
        });
      }
    }
    // ADDED Step 2-b
    else if (visualVariable == "Direction"){
      if(targetD === directionBase) {
        objectsAppearance.push({
          angel: targetP, // constant
          direction: directionBase
        });
      } else {
        objectsAppearance.push({
          angel: targetP, // constant
          direction: directionRotate
        });
      }
    }
    // ADDED Step 2-c
    else{
      if (targetP == parallel && targetD == directionBase){
        if (objectCount == 9){
          for (var j = 0; j < 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
          }
          for (var j = 0; j < 2; j++){
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
          }
        }
        else{
          for (var j = 0; j < (objectCount - 1) / 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
          }
        }
      }
      else if (targetP == parallel && targetD == directionRotate){
        if (objectCount == 9){
          for (var j = 0; j < 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
          }
          for (var j = 0; j < 2; j++){
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
          }
        }
        else{
          for (var j = 0; j < (objectCount - 1) / 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
          }
        }
      }
      else if (targetP == 15 && targetD == directionBase){
        if (objectCount == 9){
          for (var j = 0; j < 3; j++){
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
          }
          for (var j = 0; j < 2; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
          }
        }
        else{
          for (var j = 0; j < (objectCount - 1) / 3; j++){
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
          }
        }
      }
      else{
        if (objectCount == 9){
          for (var j = 0; j < 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
          }
          for (var j = 0; j < 2; j++){
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
          }
        }
        else{
          for (var j = 0; j < (objectCount - 1) / 3; j++){
            objectsAppearance.push({
              angel: parallel,
              direction: directionRotate
            });
            objectsAppearance.push({
              angel: parallel,
              direction: directionBase
            });
            objectsAppearance.push({
              angel: nonParallel,
              direction: directionBase
            });
          }
        }
      }
    }
  }
  

  // 3. Shuffle the list of objects (useful when there are variations regarding both visual variable) and add the target at a specific index
  shuffle(objectsAppearance);
  // draw a random index for the target
  ctx.targetIndex = Math.floor(Math.random()*objectCount);
  // and insert it at this specific index
  objectsAppearance.splice(ctx.targetIndex, 0, {angel:targetP, direction:targetD});

  // 4. We create actual SVG shapes and lay them out as a grid
  // compute coordinates for laying out objects as a grid
  var gridCoords = gridCoordinates(objectCount, 60);
  var adjust = gridLength/4;
  var lineWidth = 3;
  var lineHeight = 28;
  var lineMargin = 7;

  // display all objects by adding actual SVG shapes
  for (var i = 0; i < objectCount; i++) {
    if (i == ctx.targetIndex){
      var groupObject = group.append("g")
      .attr("target",true)
      .attr("transform","rotate(" + objectsAppearance[i].direction + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
      
      groupObject.append("rect")
      .attr("class","left")
      .attr("x",gridCoords[i].x-lineMargin)
      .attr("y",gridCoords[i].y-adjust)
      .attr("width",lineWidth)
      .attr("height",lineHeight)
      .attr("transform","rotate(" + convertSign(objectsAppearance[i].angel) + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
      groupObject.append("rect")
      .attr("class","right")
      .attr("x",gridCoords[i].x+lineMargin)
      .attr("y",gridCoords[i].y-adjust)
      .attr("width",lineWidth)
      .attr("height",lineHeight)
      .attr("transform","rotate(" + objectsAppearance[i].angel + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
    }
    else{
      var angelOther;
      if(objectsAppearance[i].angel == parallel){
        angelOther = nonParallel;
      } else {
        angleOther = parallel;
      };
      var groupObject = group.append("g")
      .attr("target",false)
      .attr("transform","rotate(" + objectsAppearance[i].direction + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
      
      groupObject.append("rect")
      .attr("class","left")
      .attr("x",gridCoords[i].x-lineMargin)
      .attr("y",gridCoords[i].y-adjust)
      .attr("width",lineWidth)
      .attr("height",lineHeight)
      .attr("transform","rotate(" + convertSign(angelOther) + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
      groupObject.append("rect")
      .attr("class","right")
      .attr("x",gridCoords[i].x+lineMargin)
      .attr("y",gridCoords[i].y-adjust)
      .attr("width",lineWidth)
      .attr("height",lineHeight)
      .attr("transform","rotate(" + angelOther + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
    }
  }
  ctx.startTime = Date.now();
}

var displayPlaceholders = function() {
  ctx.state = state.PLACEHOLDERS;

  var oc = ctx.trials[ctx.cpt]["OC"];
  var objectCount = 0;

  if(oc === "Small") {
    objectCount = 9;
  } else if(oc === "Medium") {
    objectCount = 25;
  } else {
    objectCount = 49;
  }

  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
  .attr("id", "placeholders")
  .attr("transform", "translate(100,100)");

  var gridCoords = gridCoordinates(objectCount, 60);
  var adjust = gridLength/2;
  for (var i = 0; i < objectCount; i++) {
    if (i == ctx.targetIndex){
      var placeholder = group.append("rect")
      .attr("x", gridCoords[i].x-adjust)
      .attr("y", gridCoords[i].y-adjust)
      .attr("width", gridLength)
      .attr("height", gridLength)
      .attr("fill", "Gray")
      .attr("target", true);
    }
    else{
      var placeholder = group.append("rect")
      .attr("x", gridCoords[i].x-adjust)
      .attr("y", gridCoords[i].y-adjust)
      .attr("width", gridLength)
      .attr("height", gridLength)
      .attr("fill", "Gray")
      .attr("target", false);
    }

    placeholder.on("click",
        function() {
          // TODO
          // ADDED step 1-b
          ctx.endTime = Date.now();
          if (this.getAttribute("target") == "true"){
            ctx.visualSearchTime = ctx.endTime - ctx.startTime;
            ctx.loggedTrials.push(["Preattention-experiment",ctx.trials[ctx.cpt]["ParticipantID"], ctx.trials[ctx.cpt]["TrialID"], ctx.trials[ctx.cpt]["Block1"],ctx.trials[ctx.cpt]["Trial"],ctx.trials[ctx.cpt]["VV"],ctx.trials[ctx.cpt]["OC"],ctx.visualSearchTime,ctx.errorCount]);
            ctx.errorCount = 0;
            d3.select("#placeholders").remove();
            if (ctx.participant != ctx.trials[ctx.cpt]["ParticipantID"]){
              console.log("Prev part: " + ctx.participant + " differs from Current part: " + ctx.trials[ctx.cpt]["ParticipantID"]);
            }
            else{
              if (ctx.cpt != ctx.trials.length - 1){
                nextTrial();
              }
            }
          }
          else{
            ctx.errorCount++;
            d3.select("#placeholders").remove();
            displayShapes();
          }
        }
      );

  }
}

var keyListener = function(event) {
  event.preventDefault();

  if(ctx.state == state.INSTRUCTIONS && event.code == "Enter") {
    d3.select("#instructions").remove();
    displayShapes();
  }//ADDED step 1-a
  else if(ctx.state == state.SHAPES && event.code == "Space") {
    d3.select("#shapes").remove();
    displayPlaceholders();
  }

}

var downloadLogs = function(event) {
  event.preventDefault();
  var csvContent = "data:text/csv;charset=utf-8,";
  console.log("logged lines count: "+ctx.loggedTrials.length);
  ctx.loggedTrials.forEach(function(rowArray){
   var row = rowArray.join(",");
   csvContent += row + "\r\n";
   console.log(rowArray);
  });
  var encodedUri = encodeURI(csvContent);
  var downloadLink = d3.select("form")
  .append("a")
  .attr("href",encodedUri)
  .attr("download","logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv")
  .text("logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv");
}


// returns an array of coordinates for laying out objectCount objects as a grid with an equal number of lines and columns
function gridCoordinates(objectCount, cellSize) {
  var gridSide = Math.sqrt(objectCount);
  var coords = [];
  for (var i = 0; i < objectCount; i++) {
    coords.push({
      x:i%gridSide * cellSize,
      y:Math.floor(i/gridSide) * cellSize
    });
  }
  return coords;
}

// shuffle the elements in the array
// copied from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(array) {
  var j, x, i;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = array[i];
    array[i] = array[j];
    array[j] = x;
  }
  return array;
}

/*********************************************/

var createScene = function(){
  var svgEl = d3.select("#scene").append("svg");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
  .classed("centered", true);

  loadData(svgEl);
};


/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function(trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setTrial(options[0]);

}

var setParticipant = function(participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(!(ctx.trials[i][ctx.blockIndex] === block)
          && (touchstone == 2 || ctx.trials[i][ctx.practiceIndex] === "false")) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setBlock(options[0]);

};

function onchangeParticipant() {
  selectValue = d3.select("#participantSel").property("value");
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select("#blockSel").property("value");
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property("value");
  setTrial(selectValue);
};
