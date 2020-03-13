//DEBUG var svgWidth = 650;
//DEBUG var svgHeight = 500;


function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg params
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;


// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]));

    //chartGroup.selectAll("text")
    //  .data(data)
    //  .enter()
    //  .append("text")
    //  .text((d) => d.abbr)
    //  .attr("fill", "white")
    //  .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //  .attr("cy", d => yLinearScale(d[chosenYAxis]));
    //  .attr("x", d => xLinearScale(d[chosenXAxis])-12)
    //  .attr("y", d => yLinearScale(d[chosenYAxis])+5);


  return circlesGroup;
}

// function used for updating circles group with a transition to
// new labels
function renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("x", d => xLinearScale(d[chosenXAxis])-12)
    .attr("y", d => yLinearScale(d[chosenYAxis])+5)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]));

    //chartGroup.selectAll("text")
    //  .data(data)
    //  .enter()
    //  .append("text")
    //  .text((d) => d.abbr)
    //  .attr("fill", "white")
    //  .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //  .attr("cy", d => yLinearScale(d[chosenYAxis]));
    //  .attr("x", d => xLinearScale(d[chosenXAxis])-12)
    //  .attr("y", d => yLinearScale(d[chosenYAxis])+5);


  return circleLabels;
}


// function used for updating circles group with new tooltip
function updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup) {

  //DEBUG console.log("data: ", data);

  switch(chosenXAxis) {
    case "poverty":
      chosenXLabel = "Poverty";
      break;
    case "smokes":
      chosenXLabel = "Smokes";
      break;
    case "obesity":
      chosenXLabel = "Obesity";
      break;
    default:
      console.log("Did you forget to choose an X Axis?");
  }

  switch(chosenYAxis) {
    case "age":
      chosenYLabel = "Age";
      break;
    case "income":
      chosenYLabel = "Income";
      break;
    case "healthcare":
      chosenYLabel = "Health Care";
      break;
    default:
      console.log("Did you forget to choose a Y Axis?");
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${chosenXLabel}: ${d[chosenXAxis]}<br>${chosenYLabel}: ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Import Data
d3.csv("assets/data/data.csv").then(function(data) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    data.forEach(function(data) {
      data.abbr = data.abbr;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });


    // Step 2: Create scale functions
    // ==============================
    var chosenXAxis = "poverty";
    var chosenXLabel = "Poverty";
    var chosenYAxis = "age";
    var chosenYLabel = "Age";

    var xLinearScale = xScale(data, chosenXAxis);

    var yLinearScale = yScale(data, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);

    xAxis = renderXAxis(xLinearScale, xAxis);
    yAxis = renderYAxis(yLinearScale, yAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "#2E9AFE")
    .attr("opacity", ".5");

    var circleLabels = chartGroup.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("fill", "white")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("x", d => xLinearScale(d[chosenXAxis])-12)
      .attr("y", d => yLinearScale(d[chosenYAxis])+5)
      .text(d => d.abbr);
       

// Create group for  2 x-axis labels
  var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  var povertyLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 380)
    .attr("value", "poverty") // value to grab for event listener
    .classed("axis-text", true)
    .classed("active", true)
    .text("Poverty");

  var smokesLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 400)
    .attr("value", "smokes") // value to grab for event listener
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Smokes");

  var obesityLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 420)
    .attr("value", "obesity") // value to grab for event listener
    .classed("axis-text", true)
    .classed("inactive", true)
    .text("Obesity");

// Create group for  2 y-axis labels
  var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${height / 2}, ${width + 20})`);

  var ageLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 300)
    .attr("y", -400)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .classed("axis-text", true)
    .text("Age");


  var incomeLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 300)
    .attr("y", -420)
    .classed("inactive", true)
    .classed("axis-text", true)
    .attr("value", "income") // value to grab for event listener
    .text("Income");

  var healthcareLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 300)
    .attr("y", -380)
    .classed("inactive", true)
    .classed("axis-text", true)
    .attr("value", "healthcare") // value to grab for event listener
    .text("Health Care");


  // updateToolTip function above csv import

  var circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);


    // Step 6: Initialize tool tip
    // ==============================

    // Step 7: Create tooltip in the chart
    // ==============================

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================

  // x axis labels event listener
  xLinearScale = xScale(data, chosenXAxis);
  yLinearScale = yScale(data, chosenYAxis);
  xAxis = renderXAxis(xLinearScale, xAxis);
  yAxis = renderYAxis(yLinearScale, yAxis);
  labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        yAxis = renderYAxis(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


  // y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;


        // functions here found above csv import
        // updates  scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxis(yLinearScale, yAxis);

        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        switch(chosenXAxis) {
          case "poverty":
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("inactive", true)
              .classed("active", false);
            obesityLabel
              .classed("inactive", true)
              .classed("active", false);
            break;
          case "smokes":
            povertyLabel
              .classed("inactive", true)
              .classed("active", false);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("inactive", true)
              .classed("active", false);
            break;
          case "obesity":
            povertyLabel
              .classed("inactive", true)
              .classed("active", false);
            smokesLabel
              .classed("inactive", true)
              .classed("active", false);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            break;
          default:
            console.log("Did you forget to choose an X Axis?");
        }
        switch(chosenYAxis) {
          case "age":
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("inactive", true)
              .classed("active", false);
            healthcareLabel
              .classed("inactive", true)
              .classed("active", false);
            break;
          case "income":
            ageLabel
              .classed("inactive", true)
              .classed("active", false);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("inactive", true)
              .classed("active", false);
            break;
          case "healthcare":
            ageLabel
              .classed("inactive", true)
              .classed("active", false);
            incomeLabel
              .classed("inactive", true)
              .classed("active", false);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            break;
          default:
            console.log("Did you forget to choose an Y Axis?");
        }
      }
    });
  }).catch(function(error) {
    console.log(error);
  });
}

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

