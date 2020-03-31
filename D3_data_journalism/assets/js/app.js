function makeResponsive() {

    // GLOBAL VARIABLES
    // SVG wrapper dimensions are determined by the current width
    // and height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
    // Chart data
    var healthData = null;
    // the buffers
    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 45
    };
    // the SVG size
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    // Axes choices
    var chosenXAxis = "income";
    var chosenYAxis = "smokes";
    // Labels for axes choices
    var labels = {
        "income": "Median Income ($)",
        "smokes": "Smokers (%)"
    }
    // radius of the circles
    var r = 10;


    // START THE HTML
    // wipe any previous attempts
    var svgArea = d3.selectAll("svg");
    //console.log(svgArea);
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // FUNCTIONS
    // function used for updating x-scale var upon click on axis label
    function xScale(healthData, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
        // console.log(width);
        return xLinearScale;
    }; // end of xScale

    // function used for updating y-scale var upon click on axis label
    function yScale(healthData, chosenYAxis) {
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d[chosenYAxis])])
            .range([height, 0]);
        return yLinearScale;
    }; // end of xScale

    // function used for updating xAxis var upon click on axis label
    function renderAxes(xScale, xAxis) {
        var bottomAxis = d3.axisBottom(xScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }; // end of renderAxes

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, xScale, chosenXAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => xScale(d[chosenXAxis]));
        return circlesGroup;
    }; // end of renderCircles

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(d => `<strong>${d.state} <br>${labels[chosenXAxis]}: ${d[chosenXAxis]} <br>${labels[chosenYAxis]}: ${d[chosenYAxis]}<strong>`);
    
        circlesGroup.call(toolTip);

        // mouseover events
        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data);
        });

        // mouseout events
        circlesGroup.on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
        return circlesGroup;
    }; // end of updateToolTip

    // Do everything to set up the svg from scratch
    function init() {
        // make scales
        var xLinearScale = xScale(healthData, chosenXAxis);
        var yLinearScale = yScale(healthData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)

        // make the enter marker
        var circlesGroup = circlesGroup.enter()
            .append("g")
            .attr("id", "elemEnter");

        // Create the circle for each block
        circlesGroup.append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", r)
            .attr("fill", "blue")
            .attr("opacity", ".6");
        
        // Create the text for each circle
        circlesGroup.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + r/3)
        .classed("stateText", true)
        .attr("font-size", parseInt(r*0.9))
        .text(d => d.abbr);


        // Create group for  3 x- axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var labelOne = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", chosenXAxis) // value to grab for event listener
            .classed("active", true)
            .text(labels[chosenXAxis]);

        // var lowLabel = labelsGroup.append("text")
        // .attr("x", 0)
        // .attr("y", 40)
        // .attr("value", "smokesLow") // value to grab for event listener
        // .classed("inactive", true)
        // .text("% Light Smokers");

        // var genLabel = labelsGroup.append("text")
        // .attr("x", 0)
        // .attr("y", 60)
        // .attr("value", "smokes") // value to grab for event listener
        // .classed("inactive", true)
        // .text("% Smokers");

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("active", true)
            .text(labels[chosenYAxis])
            .attr("strong");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(healthData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                //     // changes classes to change bold text
                //     if (chosenXAxis === "smokesHigh") {
                //         highLabel
                //             .classed("active", true)
                //             .classed("inactive", false);
                //         lowLabel
                //             .classed("active", false)
                //             .classed("inactive", true);
                //         genLabel
                //             .classed("active", false)
                //             .classed("inactive", true);
                //     }
                //     else if (chosenXAxis === "smokesLow") {
                //         highLabel
                //             .classed("active", false)
                //             .classed("inactive", true);
                //         lowLabel
                //             .classed("active", true)
                //             .classed("inactive", false);
                //         genLabel
                //             .classed("active", false)
                //             .classed("inactive", true);
                //     }
                // }
                // else {
                //     highLabel
                //         .classed("active", false)
                //         .classed("inactive", true);
                //     lowLabel
                //         .classed("active", false)
                //         .classed("inactive", true);
                //     genLabel
                //         .classed("active", true)
                //         .classed("inactive", false);
                }; // end of if
            }); // end of listener
    }; // end of init

    // LOAD THE DATA AND DO STUFF
    // Load data from data.csv
    d3.csv("assets/data/data.csv").then((data, error) => {
        // Throw an error if one occurs in case we want to handle it in some way
        if (error) throw error;

        // Parse data: Cast the columns we care about to numbers
        data.forEach(function (data) {
            data.income = +data.income;
            data.smokes = +data.smokes;
        });

        // load the data for the whole file
        healthData = data;
        // Initialize scatter chart
        init();
    });
}; // end of makeResponsive

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);