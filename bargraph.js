(function() {

  let data = "";
  let svgContainer = "";

  // load data and make barchart after window loads
  window.onload = function() {
    // append a 1000x500 SVG to body
    svgContainer = d3.select('body').append('svg')
      .attr('width', 1000)
      .attr('height', 500);

    svgContainer.append('text')
      .attr('x', 50)
      .attr('y', 40)
      .text('Average Viewership By Season')
      .style("font-size", "24px");;

    // load in seasons data and call makeBarChart function
    d3.csv('seasons.csv')
      .then((data) => makeBarChart(data));
  }

  // make barchart
  function makeBarChart(csvData) {
    data = csvData;
    
    // get an array of years and an array of viewers
    let years = data.map((row) => (+row["Year"]));
    let viewers = data.map((row) => parseFloat(row["Viewers"]));

    // call findMinMax to find min and max of years and viewers
    let axesLimits = findMinMax(years, viewers);

    // draw barchart elements
    let mapFunctions = drawTicks(axesLimits);
    plotData(mapFunctions);
    plotLine(mapFunctions);
    makeLegend();
  }

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;
    
    let div = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

    var tooltip = d3.select("body").append("div").attr("class", "tooltip");

    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', (d) => xMap(d) - 10)
        .attr('y', yMap)
        .attr('width', 25)
        .attr('height', (d) => 450 - yMap(d))
        .attr("fill", function(d) {
          if (d.Data == 'Estimated') {
            return "#8F8782";
          } else {
            return "#6AADE4";
          }
        })
        .attr("stroke", "grey")
        .on("mousemove", function(d){
          tooltip
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY + "px")
            .style("display", "inline-block")
            .style("border", "solid black 1px")
            .html("Season #" + d.Year + "<br>" +
            "Year: " + d.Year + "<br>" +
            "Episodes: " + d.Episodes + "<br>" +
            "Avg Viewers (mil): " + d.Viewers + "<br>" + "<br>" +
            "Most Watched Episode: " + d.MostWatched + "<br>" +
            "Viewers (mil): " + d.AllViewers);
      })
      .on("mouseout", function(){ tooltip.style("display", "none");});

      svgContainer.selectAll(".text")  		
        .data(data)
        .enter()
        .append("text")
        .attr("class","label")
        .attr("x", (function(d) { return xMap(d) - 10; }  ))
        .attr("y", function(d) { return yMap(d) - 10; })
        .attr("dy", ".75em")
        .text(function(d) { return d.Viewers; })
        .style("font-size", "10px");  

  }

  // plot average line
  function plotLine(map) {
    let xMap = map.x;

    var line = d3.line()
        .x(function(d) { return xMap(d); })
        .y(function() { return 320; }); 

    svgContainer.append("path")
        .datum(data)
        .attr("d", line)
        .style("stroke-dasharray", ("7, 3"))
        .attr("stroke-width", 3)
        .attr("stroke", "grey");
      svgContainer.append("rect")   
        .attr("x", 57)
        .attr("y", 299)
        .attr("width", 37)
        .attr("height", 18)
        .style("fill", "white")
        .attr("opacity","0.7");
      svgContainer.append("text")
        .attr("x", 58)
        .attr("y", 310)
        .text("13.46")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle");
    
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    let xValue = function(d) { return +d["Year"]; }

    let xScale = d3.scaleLinear()
      .domain([limits.yearMin - .5, limits.yearMax + .5])
      .range([50, 950]);

    let xMap = function(d) { return xScale(xValue(d)); };

    let xAxis = d3.axisBottom()
      .ticks(20)
      .tickFormat(d3.format("d"))
      .scale(xScale);

    svgContainer.append('g')
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    svgContainer.append('text')
      .attr('x', 500)
      .attr('y', 500)
      .text('Year');

    let yValue = function(d) { return +d.Viewers}

    let yScale = d3.scaleLinear()
      .domain([limits.viewersMax + 3, limits.viewersMin - 0.05])
      .range([50, 450]);

    let yMap = function (d) { return yScale(yValue(d)); };

    let yAxis = d3.axisLeft().scale(yScale);

    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .text('Avg. Viewers (in millions)');

    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };

  }

  // find min and max for years and viewers
  function findMinMax(year, viewers) {

    let yearMin = d3.min(year);
    let yearMax = d3.max(year);

    yearMax = Math.round(yearMax*10)/10;
    yearMin = Math.round(yearMin*10)/10;

    let viewersMin = d3.min(viewers);
    let viewersMax = d3.max(viewers);

    viewersMax = Number((Math.ceil(viewersMax*20)/20).toFixed(2));
    viewersMin = Number((Math.ceil(viewersMin*20)/20).toFixed(2));

    return {
      yearMin : yearMin,
      yearMax : yearMax,
      viewersMin : viewersMin,
      viewersMax : viewersMax
    }

  }

  // make legend
  function makeLegend() {
      svgContainer.append("rect")   
          .attr("x",840)
          .attr("y",88)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", "#6AADE4")
          .attr("stroke", "#8F8782");
      svgContainer.append("rect")
          .attr("x",840)
          .attr("y",118)
          .attr("width", 20)
          .attr("height", 20) 
          .style("fill", "#8F8782")
          .attr("stroke", "#8F8782");
      svgContainer.append("text")
          .attr("x", 870)
          .attr("y", 100)
          .text("Actual")
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");
      svgContainer.append("text")
          .attr("x", 870)
          .attr("y", 130)
          .text("Estimated")
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");
      svgContainer.append("text")
          .attr("x", 840)
          .attr("y", 78)
          .text("Viewership Data")
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");
  }
  
  })();
  