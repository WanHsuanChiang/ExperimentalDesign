var touchstone = 2;

var state = {
  NONE:0,
  INSTRUCTIONS: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
  INTERFERENCE: 4,
};
var test;
var ctx = {
  w: 400,
  h: 400,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,
  targetP: 0,
  targetD: 0,

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
    [["Participant","Practice","Block","Trial","VV","OC","visualSearchTime","ErrorCount","targetP","targetD"]] :
    [["DesignName","ParticipantID","TrialID","Block1","Trial","VV","OC","visualSearchTime","ErrorCount","targetP","targetD"]],
  
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

  d3.select("#end").remove();
  d3.select("#start").remove();
  d3.select("#instructions").remove();
  d3.select("#shapes").remove();
  d3.select("#placeholders").remove();
  d3.select("#count").remove();

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

// add end trial function
var nextTrial = function() {
  ctx.cpt++;
  if(ctx.trials[ctx.cpt]["ParticipantID"] !== ctx.participant) {
    displayEnd();
  } else {
    displayInstructions();    
  }  
}

var displayStart = function() {

  d3.select("#instr")
    .append("div")
    .attr("id","start")
    .attr("class","container");

  d3.select("#start")
    .append("div")
    .append("p")
    .html("Thank you for attending this experiment which tests whether the visual variables such as shapes, color, and size, are preattentive or not. You will be asked to select the object that is different from others as fast as possible. The experiement will take less than 10 minutes. The usage of your results is for academic purposes only and will not open to the public. Thank you for your participation.");
  
  d3.select("#start")
    .append("p")
    .html("Best,<br>Ainura and Angela")

  var ul = d3.select("#start")
    .append("div")
    .attr("id","info")
    .append("ul");
  
  var info = [
      "Students: <a href=\"mailto:ainura011194@gmail.com\">Ainura Dalabayeva</a>, <a href=\"mailto:wan-hsuan.chiang@universite-paris-saclay.fr\">Wan-Hsuan Chiang (Angela)</a>",
      "Professor: Caroline Appert",
      "Course: Experimental Design and Analysis",
      "University: University of Paris-Saclay"
  ];  
  
  for (var i = 0; i < info.length; i++){
    ul.append("li").html(info[i]);
  };
  
  // button area
  d3.select("#start")
    .append("div")
    .attr("id","start-action")
    .attr("class","action")
    .attr("class","container");
  
  d3.select("#start-action")
    .append("button")
    .attr("onclick","startExperiment(event)")//add startExperiment event
    .html("Go"); 
  
  d3.select("#start")
    .append("p")
    .html("Please make sure you select the correct participant ID");
}

var displayInstructions = function() {
  ctx.state = state.INSTRUCTIONS;

  d3.select("#instr")
    .append("div")
    .attr("id", "instructions")
    .classed("instr", true);

  d3.select("#instructions")
    .append("p")
    .html("Multiple shapes will get displayed. Only <strong>one shape</strong> is different from all other shapes.");

  // order list start
  var steps = [
    "Spot it as fast as possible and press <span class=\"key\">Space</span> bar;",
    "Click on the placeholder over that shape."
  ];

  var ol = d3.select("#instructions")
  .append("ol");

  for (var i = 0; i < steps.length; i++){
    ol.append("li").html(steps[i]);
  }
  // order list end

  d3.select("#instructions")
    .append("p")
    .html("Press <span class=\"key\">Space</span> key when ready to start.");

}

var displayCounter = function() {

  d3.select("#counter")
    .append("div")
    .attr("id", "count")
    .attr("class", "counter")

  d3.select("#count")
    .append("p")
    .html("Experiment  " + ctx.trials[ctx.cpt]["TrialID"] + "/" + ctx.trials.filter(trial => trial.ParticipantID == ctx.participant ).length);

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
  .attr("transform", "translate(50,50)");

  // 1. Decide on the visual appearance of the target
  // In my example, it means deciding on its size (large or small) and its color (light or dark)
  var randomNumber1 = Math.random();
  var randomNumber2 = Math.random();
  
  var parallel = 0;
  var nonParallel = 30;
  //var directionBase = getRandomInt(0,360);
  var directionBase = 45;
  var directionRotate = directionBase + 90;
  //var targetParallelism, targetDirection
  //Define the value
  var targetP, targetD; 
  if(randomNumber1 > 0.5) {
    targetP = parallel; // target is parallel    
  } else {
    targetP = nonParallel; // target is not parallel
  }
  if(randomNumber2 > 0.5) {
    targetD = directionBase; // target direction    
  } else {
    targetD = directionRotate; // target direction and rotate 45 degree more
  }

  console.log("targetP: " + targetP);
  console.log("targetD: " + targetD);
  ctx.targetP = targetP;
  ctx.targetD = targetD;

  // 2. Set the visual appearance of all other objects now that the target appearance is decided
  // Here, we implement the case VV = "Size" so all other objects are large (resp. small) if target is small (resp. large) but have the same color as target.
  var objectsAppearance = [];

  // VV = Parallelism
  if(visualVariable == "Parallelism"){
    for (var i = 0; i < objectCount-1; i++){
      if(targetP === parallel) {        
        // if target object is parallel, then others are...        
        objectsAppearance.push({
          angel: nonParallel,
          direction: targetD // constant
        });
      } else {
        // if target object is not parallel, then others are...        
        objectsAppearance.push({
          angel: parallel,
          direction: targetD // constant
        });
      }
    }
  } 
  // VV = Direction
  else if (visualVariable == "Direction") {
    for (var i = 0; i < objectCount-1; i++){
      if(targetD === directionBase) {
        // if target object apply to directionBase, then others are...
        objectsAppearance.push({
          angel: targetP, // constant
          direction: directionRotate
        });
      } else {
        // if target object apply to directionRotate, then others are...
        objectsAppearance.push({          
          angel: targetP, // constant
          direction: directionBase
        });
      }
    }    
  }
  // VV = ParallelismDirection (Combination)
  else { 

    /*
    var listss = [
      [parallel,directionBase],
      [parallel,directionRotate],
      [nonParallel,directionBase],
      [nonParallel,directionRotate]
    ];
    // remove target combination in the list
    for(var n = 0; n < listss.length; n++){
      if( listss[n] == [targetP,targetD]){
        listss.splice(n,1);
      }
    }
    console.log("after:"+listss);
    */

    // allocate the rest of the object appearance
    let canAllocate = (objectCount-1)-2*3;
    let a1 = getRandomInt(0,canAllocate+1);
    let a2 = getRandomInt(0,canAllocate-a1+1);
    let a3 = canAllocate-a1-a2;
    var subCount = [ a1+2 , a2+2 , a3+2 ];
    shuffle(subCount);

    var lists = [];
    if(targetP === parallel){
      lists.push([nonParallel,directionBase,subCount[0]]);
      lists.push([nonParallel,directionRotate,subCount[1]]);
      if (targetD === directionBase){
        lists.push([parallel,directionRotate,subCount[2]]);
      } else {
        lists.push([parallel,directionBase,subCount[2]]);
      }
    } else {
      lists.push([parallel,directionBase,subCount[0]]);
      lists.push([parallel,directionRotate,subCount[1]]);
      if(targetD === directionBase){
        lists.push([nonParallel,directionRotate,subCount[2]]);
      } else {
        lists.push([nonParallel,directionBase,subCount[2]]);
      }
    }

    for(var i = 0; i < lists.length; i++) {
      var list = lists[i];
      for(var j = 0; j < list.length; j++) {
          for(var k = 0; k < list[2]; k++){
            objectsAppearance.push({
              angel: list[0],
              direction: list[1]
            });
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

    var groupObject = group.append("g")
    .attr("target",Boolean(i == ctx.targetIndex))
    .attr("transform","rotate(" + objectsAppearance[i].direction + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");

    groupObject.append("rect")
    .attr("class","left")
    .attr("x",gridCoords[i].x-lineMargin)
    .attr("y",gridCoords[i].y-adjust)
    .attr("width",lineWidth)
    .attr("height",lineHeight)
    //.attr("transform","rotate(" + convertSign(objectsAppearance[i].angel) + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
    .attr("transform","rotate(" + 0 + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");
    groupObject.append("rect")
    .attr("class","right")
    .attr("x",gridCoords[i].x+lineMargin)
    .attr("y",gridCoords[i].y-adjust)
    .attr("width",lineWidth)
    .attr("height",lineHeight)
    .attr("transform","rotate(" + objectsAppearance[i].angel + "," + gridCoords[i].x + "," + gridCoords[i].y + ")");

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
  .attr("transform", "translate(50,50)");

  var gridCoords = gridCoordinates(objectCount, 60);
  var adjust = gridLength/2;
  for (var i = 0; i < objectCount; i++) {
    var placeholder = group.append("rect")
      .attr("x", gridCoords[i].x-adjust)
      .attr("y", gridCoords[i].y-adjust)
      .attr("width", gridLength)
      .attr("height", gridLength)
      .attr("fill", "Gray")
      .attr("target", Boolean(i == ctx.targetIndex));

    placeholder.on("click",
        function() {
          // TODO
          // ADDED step 1-b
          ctx.endTime = Date.now();
          d3.select("#count").remove();
          if (this.getAttribute("target") == "true"){
            console.log("correct");
            ctx.visualSearchTime = ctx.endTime - ctx.startTime;
            ctx.loggedTrials.push(["Preattention-experiment",ctx.trials[ctx.cpt]["ParticipantID"], ctx.trials[ctx.cpt]["TrialID"], ctx.trials[ctx.cpt]["Block1"],ctx.trials[ctx.cpt]["Trial"],ctx.trials[ctx.cpt]["VV"],ctx.trials[ctx.cpt]["OC"],ctx.visualSearchTime,ctx.errorCount,ctx.targetP,ctx.targetD]);
            ctx.errorCount = 0;
            d3.select("#placeholders").remove();
            if (ctx.participant != ctx.trials[ctx.cpt]["ParticipantID"]){
              console.log("Prev part: " + ctx.participant + " differs from Current part: " + ctx.trials[ctx.cpt]["ParticipantID"]);
            }
            else{              
              if (ctx.cpt != ctx.trials.length - 1){
                nextTrial();
              } else {
                displayEnd();
              }
            }
          }
          else{
            console.log("error");
            ctx.errorCount++;
            restartTrial();
          }
        }
      );
  }
}

var displayEnd = function() {
  ctx.state = state.NONE;

  d3.select("#placeholders").remove();

  d3.select("#instr")
    .append("div")
    .attr("id","end")
    .attr("class","container");

  d3.select("#end")
    .append("div")
    .append("p")
    .html("Thank you for participating the experiment. Please download the log file and send it back to Angela or Ainura.");

  var emails = [
    "Ainura Dalabayeva: <a href=\"mailto:ainura011194@gmail.com\">ainura011194@gmail.com</a>",
    "Wan-Hsuan Chiang (Angela): <a href=\"mailto:wan-hsuan.chiang@universite-paris-saclay.fr\">wan-hsuan.chiang@universite-paris-saclay.fr</a>"
  ];

  var ol = d3.select("#end").append("div").append("ol");
  for (var i = 0; i < emails.length; i++){
    ol.append("li").html(emails[i]);
  };

  
  d3.select("#end")
    .append("div")
    .attr("id","end-action")
    .attr("class","action")
    .attr("class","container");    
  
  d3.select("#end-action")
    .append("button")
    .attr("onclick","downloadLogs(event)")//add downloadLogs event
    .html("Download Log File"); 
}

// restart the trial
var restartTrial = function(){
  d3.select("#count").remove();
  if(ctx.state == state.INTERFERENCE){
    d3.select("#shapes").remove();
    displayInstructions();
  } else if (ctx.state == state.PLACEHOLDERS){
    d3.select("#placeholders").remove();
    displayInstructions();
  } else {
    return;
  }  
}

var keyListener = function(event) {
  event.preventDefault();

  if(event.code == "Space") {
    if(ctx.state == state.INSTRUCTIONS){
      d3.select("#instructions").remove();
      displayCounter();
      displayShapes();
    } else if (ctx.state == state.SHAPES){
      d3.select("#shapes").remove();
      displayPlaceholders();
    } else {
      return;
    }
  } else {
    return;
  }
}

// the alert box will display while users moving cursor when shape displayed
var mouseListener = function(event){
    
  if(ctx.state == state.SHAPES){
    ctx.state = state.INTERFERENCE;
    var alert = document.getElementById("alert");
    d3.select("#modal-content > p").remove();
    d3.select("#modal-content")
      .append("p")
      .html("Do not move your cursor during each trial. This trial will restart after you close the this message.");
    alert.style.display = "flex";
  }
}

// Reference" https://stackoverflow.com/questions/667555/how-to-detect-idle-time-in-javascript-elegantly
var idleTimeOut = function() {
  var time;
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;

    function alert() {      
      if(ctx.state == state.SHAPES){
        ctx.state = state.INTERFERENCE;
        var alert = document.getElementById("alert");
        d3.select("#modal-content > p").remove();
        d3.select("#modal-content")
          .append("p")
          .html("Time out. The trial will restart after you close this messsage.");
        alert.style.display = "flex";
      }
    }

    function resetTimer() {
        clearTimeout(time);
        time = setTimeout(alert, 1000*60*10)
        // 1000 milliseconds = 1 second
    }  
}

// close alert box and restart the trial
var closeModal = function(event){  
  var alert = document.getElementById("alert");
  alert.style.display = "none";
  restartTrial();
}

// close alert box and restart the trial
window.onclick = function(event) {
  var alert = document.getElementById("alert");
  if (event.target == alert) {
    alert.style.display = "none";
    restartTrial();
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

  var end =  document.getElementById("end");
  if (typeof(end) != 'undefined' && end != null)
  {
    d3.select("#end-action")
      .append("a")
      .attr("href",encodedUri)
      .attr("download","logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv")
      .text("logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv");
  }
  
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

// add - for any numbers
var convertSign = function(num){
  return -Number(num);
}

// min (included), max (excluded)
var getRandomInt = function(min,max){
  return Math.floor(Math.random() * (max - min) ) + min;
}

/*********************************************/

var createScene = function(){
  var svgEl = d3.select("#scene").append("svg");
  //svgEl.attr("width", ctx.w);
  //svgEl.attr("height", ctx.h)
  //.classed("centered", true);

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