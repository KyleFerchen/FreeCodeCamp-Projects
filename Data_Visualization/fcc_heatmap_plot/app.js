dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

function BuildGraph(data){
  
  // Define chart constants
  let chartWidth = 1200;
  let chartHeight = 600;
  let padding = 100;
  
  // Get the base temperature
  let baseTemp = data.baseTemperature;
  
  // Create <svg> to hold chart
  let svg = d3.select('#container')
    .append('svg')
    .attr('id', 'chart')
    .attr('width', chartWidth)
    .attr('height', chartHeight);
  
  // Functions to parse dates
  let GetYear = d3.timeParse("%Y");
  let GetMonth = d3.timeParse("%m");
  let PrintMonth = d3.timeFormat("%B");
  
  
  // Set up scaleBand using unique column and row names
  let uniqueCols = [];
  data.monthlyVariance.map(function(d){
    if(!uniqueCols.includes(d.year)){
      uniqueCols.push(d.year);
    }
  });
  let uniqueRows = [];
  data.monthlyVariance.map(function(d){
    if(!uniqueRows.includes(d.month)){
      uniqueRows.push(d.month);
    }
  });
  
  let xScale = d3.scaleBand()
    .domain(uniqueCols)
    .range([padding, chartWidth-padding]);
  
  let yScale = d3.scaleBand()
    .domain(uniqueRows)
    .range([chartHeight-padding, padding]);
  
  // Set up the color scale to use for the fill
  let colorScale = d3.scaleLinear()
    .domain([
      d3.min(data.monthlyVariance, (d) => {
        return baseTemp + d.variance;
      }), 
      d3.mean(data.monthlyVariance, (d) => {
        return baseTemp + d.variance;
      }),
      d3.max(data.monthlyVariance, (d) => {
        return baseTemp + d.variance;
      })
    ])
    .range(["blue", "orange", "red"]);
  
  // Time scale for x axis
  let xTime = d3.scaleTime()
    .domain([
      d3.min(data.monthlyVariance, (d) => {
        return GetYear(d.year);
      }),
      d3.max(data.monthlyVariance, (d) => {
        return GetYear(d.year);
      })
    ])
    .range([padding, chartWidth-padding]);
  
  // Time scale for the y axis
  let yTime = d3.scaleTime()
    .domain([
      d3.min(data.monthlyVariance, (d) => {
        return GetMonth(d.month);
      }),
      d3.max(data.monthlyVariance, (d) => {
        return GetMonth(d.month);
      })
    ])
    .range([chartHeight-padding, padding]);
  
  // Set up the axes
  xAxis = d3.axisBottom(xTime);
  svg.append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform','translate(0,' + (chartHeight - padding) + ')');
  
  yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => {
      return PrintMonth(GetMonth(d))
    });
  svg.append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(' + (padding - 1) + ', 0)');
  
  
  // Set up the legend
  let legendArr = d3.range(101);
  let legendColor = d3.scaleLinear()
    .domain([0,50,100])
    .range(colorScale.domain());
  
  let legendAxisScale = d3.scaleLinear().domain([0,100]).range([0,100]);
  let legendAxis = d3.axisLeft(legendAxisScale)
    .ticks(5)
    .tickFormat((d) => legendColor(d).toFixed(2));
  svg.append('g')
    .call(legendAxis)
    .attr(
      'transform',
      'translate(' + (chartWidth-(padding/2)-1).toString() + ',' + ((chartHeight/2)-50) +')'
    );
  
  svg.append('g')
    .attr('id', 'legend')
    .selectAll('rect')
    .data(legendArr)
    .enter()
    .append('rect')
    .attr('height', 1)
    .attr('width', (padding/4))
    .attr('x', chartWidth-(padding/2))
    .attr('y', (d) => ((chartHeight/2)-50+d))
    .attr('fill', (d) => colorScale(legendColor(d)));
  
  // Give the chart a title
  svg.append("text")
    .attr("id", "title")
    .attr("x", (chartWidth / 2))
    .attr("y", (padding / 3))
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .text("Monthly Global Land-Surface Temperature");
  
  svg.append("text")
    .attr("id", "description")
    .attr("x", (chartWidth / 2))
    .attr("y", ( padding / 2))
    .attr("alignment-baseline", "text-before-edge")
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .text(String.fromCharCode(176)+'C');

  
  
  // Draw heatmap cells
  svg.append('g')
    .selectAll('rect')
    .data( data.monthlyVariance )
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', (d) => d.month-1)
    .attr('data-year', (d) => d.year) 
    .attr('data-temp', (d) => baseTemp+d.variance)
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .attr('fill', (d) => colorScale(baseTemp+d.variance))
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.month))
    .on('mouseover.blink', function repeat(){
      d3.select(this)
        .transition()
        .attr('fill', 'white')
        .transition()
        .duration(500)
        .attr('fill', 'black')
        .on('end', repeat);
    })
    .on('mouseover.tooltip', function(d){
      let xThis = parseFloat(d3.select(this).attr('x'));
      let yThis = parseFloat(d3.select(this).attr('y'));
      xThis = xThis > chartWidth/2 ? (xThis - chartWidth/12) : (xThis + chartWidth/24);
      yThis = yThis > chartHeight/2 ? (yThis - chartWidth/24) : (yThis + chartWidth/24);
    
      tooltipMessage = PrintMonth(GetMonth(d.month)) +
        ", " + d.year + "<br>" + 
        (baseTemp + d.variance).toFixed(2) + "&#8451;";
    
      d3.select('#tooltip')
        .attr('data-year', d.year)
        .style('left', xThis+'px')
        .style('top', yThis+'px')
        .style('display', 'block')
        .attr('opacity', 0.8)
        .html(tooltipMessage);
    
    })
    .on('mouseout', function(){
      d3.select(this)
        .transition()
        .attr('fill', (d) => colorScale(baseTemp+d.variance));
      d3.select("#tooltip")
        .style('display', 'none');
    });
  
};

// Make request for the data
const req = new XMLHttpRequest();
req.open("GET", dataUrl, true)
req.send();
req.onload = function(){
  const json = JSON.parse(req.responseText);
  
  
  BuildGraph(json);
};