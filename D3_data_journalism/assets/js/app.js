// 
// This script creates a scatter plot of various demographics
// from the US Census and allows selection of the x- and y-axis
// values. It uses tooltips.


function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("#scatter").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg params
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  var margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;


  // Create an SVG wrapper, append an SVG group that will hold our chart, and 
  // shift the latter by left and top margins.
  var svg = d3.select("#scatter")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
  .attr("width", svgWidth)
  .attr("height", svgHeight);


  // Create a group to position the SVG wrapper at the origin.
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// This function is used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
  .range([0, width]);

  return xLinearScale;
}

// This function is used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

// This function is used to redraw xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}


// This function is used to redraw yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// This function is used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]));

  return circlesGroup;
}

// This function is used for updating circles group with a transition to new labels
function renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis) {

  circleLabels.transition()
    .duration(1000)
    .attr("x", d => xLinearScale(d[chosenXAxis])-12)
    .attr("y", d => yLinearScale(d[chosenYAxis])+5)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]));

  return circleLabels;
}


// This function is used for updating circles group with new tooltip
function updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup) {

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

data.forEach(function(data) {
  data.abbr = data.abbr;
  data.poverty = +data.poverty;
  data.age = +data.age;
  data.income = +data.income;
  data.healthcare = +data.healthcare;
  data.obesity = +data.obesity;
  data.smokes = +data.smokes;
});


//  Choose default axes
var chosenXAxis = "poverty";
var chosenXLabel = "Poverty";
var chosenYAxis = "age";
var chosenYLabel = "Age";

//  Create scales
var xLinearScale = xScale(data, chosenXAxis);
var yLinearScale = yScale(data, chosenYAxis);

// Create axis functions
var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// Append Axes to the chart
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .attr("transform", `translate(0, 0)`)
  .call(leftAxis);

// Rewrite axes to the chart
xAxis = renderXAxis(xLinearScale, xAxis);
yAxis = renderYAxis(yLinearScale, yAxis);

// Create circles
var circlesGroup = chartGroup.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", "15")
  .attr("fill", "#2E9AFE")
  .attr("opacity", ".5");

// Create circle labels
var circleLabels = chartGroup.selectAll("foo")
  .data(data)
  .enter()
  .append("text")
  .attr("fill", "white")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("x", d => xLinearScale(d[chosenXAxis])-12)
  .attr("y", d => yLinearScale(d[chosenYAxis])+5)
  .text(d => d.abbr);
       

// Create group for 3 x-axis labels and position it.
var labelsGroupX = chartGroup.append("g")
  .attr("transform", `translate(${width/2}, ${height+40})`);

// Create label for each x-axis data set.
var povertyLabel = labelsGroupX.append("text")
  .attr("value", "poverty") // value to grab for event listener
  .classed("x-axis-text", true)
  .classed("active", true)
  .text("Poverty");

var smokesLabel = labelsGroupX.append("text")
  .attr("dy",20)
  .attr("value", "smokes") // value to grab for event listener
  .classed("x-axis-text", true)
  .classed("inactive", true)
  .text("Smokes");

var obesityLabel = labelsGroupX.append("text")
  .attr("dy",40)
  .attr("value", "obesity") // value to grab for event listener
  .classed("x-axis-text", true)
  .classed("inactive", true)
  .text("Obesity");

// Create group for 3 y-axis labels and position it.
var labelsGroupY = chartGroup.append("g")
  .attr("transform", `translate(-80, ${height/2})`);

// Create label for each y-axis data set.
var ageLabel = labelsGroupY.append("text")
  .attr("transform", "rotate(-90)")
  .attr("value", "age") // value to grab for event listener
  .classed("active", true)
  .classed("y-axis-text", true)
  .text("Age");

var incomeLabel = labelsGroupY.append("text")
  .attr("transform", "rotate(-90)")
  .attr("dy",20)
  .classed("inactive", true)
  .classed("y-axis-text", true)
  .attr("value", "income") // value to grab for event listener
  .text("Income");

var healthcareLabel = labelsGroupY.append("text")
  .attr("transform", "rotate(-90)")
  .attr("dy",40)
  .classed("inactive", true)
  .classed("y-axis-text", true)
  .attr("value", "healthcare") // value to grab for event listener
  .text("Health Care");

// Create tooltip in the chart
var circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);

// Create event listeners to display and hide the tooltip

// x axis labels event listener
xLinearScale = xScale(data, chosenXAxis);
yLinearScale = yScale(data, chosenYAxis);
xAxis = renderXAxis(xLinearScale, xAxis);
yAxis = renderYAxis(yLinearScale, yAxis);
labelsGroupX.selectAll(".x-axis-text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
      // replace chosenXAxis with value
      chosenXAxis = value;

      // update x scale for new data
      xLinearScale = xScale(data, chosenXAxis);

      // update axes with transition
      xAxis = renderXAxis(xLinearScale, xAxis);
      yAxis = renderYAxis(yLinearScale, yAxis);

      // update circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

      // update tooltips with new info
      circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);

      // update circle labels with  new info
      circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

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
    }
  });


  // y axis labels event listener
  labelsGroupY.selectAll(".y-axis-text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replace chosenYAxis with value
        chosenYAxis = value;

        // update scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // update axes with transition
        yAxis = renderYAxis(yLinearScale, yAxis);
        xAxis = renderXAxis(xLinearScale, xAxis);

        // update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // update tooltips with new info
        circlesGroup = updateToolTip(data, chosenXAxis, chosenYAxis, circlesGroup);

        // update circle labels with new info
        circleLabels = renderLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // changes classes to change bold text
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

