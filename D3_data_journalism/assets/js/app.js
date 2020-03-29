function makeResponsive() {

    // The total chart size
    var svgWidth = 960;
    var svgHeight = 500;

    // the buffers
    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    // the SVG size
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // wipe any previous attempts
    var svg = d3.select("svg").remove();

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

    // Initial Params
    var chosenXAxis = "smokesHigh";

    // function used for updating x-scale var upon click on axis label
    function xScale(smokesData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(smokesData, d => d[chosenXAxis]) * 0.8,
            d3.max(smokesData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
        return xLinearScale;
    }; // end of xScale

    // function used for updating xAxis var upon click on axis label
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }; // end of renderAxes

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));
        return circlesGroup;
    }; // end of renderCircles

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
        var label;
        if (chosenXAxis === "smokesHigh") {
            label = "Smokes a Lot";
        }
        else if (chosenXAxis === "smokesLow") {
            label = "Smokes a Little";
        }
        else {
            label = "Smokes Some";
        }
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d[chosenXAxis]}%<br>
                ${d.state}<br>${label} `);
            });

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

    // // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function (smokesData) {
        // format data to numbers
        smokesData.forEach(function (data) {
            data.smokesHigh = +data.smokesHigh;
            data.income = +data.income;
        });

        // Create x scale from previous function for smoke alot
        //console.log(smokesData);
        //console.log(chosenXAxis)
        var xLinearScale = xScale(smokesData, chosenXAxis);

        // Create y scale function for income
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(smokesData, d => d.income)])
            .range([height, 0]);

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
            .data(smokesData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d.income))
            .attr("r", 20)
            .attr("fill", "blue")
            .attr("opacity", ".7");

        // Create group for  3 x- axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var heavy = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "smokesHigh") // value to grab for event listener
        .classed("active", true)
        .text("% Heavy Smokers");

        var albumsLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "smokesLow") // value to grab for event listener
        .classed("inactive", true)
        .text("% Light Smokers");

        var albumsLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("% Smokers");

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("active", true)
            .text("Income")
            .attr("strong");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // // x axis labels event listener
        // labelsGroup.selectAll("text")
        //     .on("click", function () {
        //         // get value of selection
        //         var value = d3.select(this).attr("value");
        //         if (value !== chosenXAxis) {

        //             // replaces chosenXAxis with value
        //             chosenXAxis = value;

        //             // console.log(chosenXAxis)

        //             // functions here found above csv import
        //             // updates x scale for new data
        //             xLinearScale = xScale(smokesData, chosenXAxis);

        //             // updates x axis with transition
        //             xAxis = renderAxes(xLinearScale, xAxis);

        //             // updates circles with new x values
        //             circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        //             // updates tooltips with new info
        //             circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        //             // changes classes to change bold text
        //             if (chosenXAxis === "smokesHigh") {
        //                 albumsLabel
        //                     .classed("active", true)
        //                     .classed("inactive", false);
        //                 hairLengthLabel
        //                     .classed("active", false)
        //                     .classed("inactive", true);
        //             }
        //             else {
        //                 albumsLabel
        //                     .classed("active", false)
        //                     .classed("inactive", true);
        //                 hairLengthLabel
        //                     .classed("active", true)
        //                     .classed("inactive", false);
        //             }
        //         } // end of listener
    }); // end of readData
}; // end of makeResponsive

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

