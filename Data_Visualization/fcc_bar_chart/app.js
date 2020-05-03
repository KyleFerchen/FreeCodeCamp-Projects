url_path = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'

svgWidth = 1000;
svgHeight = 500;
svgPadding = 100;


// Wait for page to load and make an Http request
document.addEventListener('DOMContentLoaded', function(){
  const req = new XMLHttpRequest();
  req.open("GET", url_path, true);
  req.send();
  req.onload = function(){
    const json = JSON.parse(req.responseText);
    //document.getElementById('svg-target').innerHTML = JSON.stringify(json);

    dataGDP = json.data;
    //document.getElementById('svg-target').innerHTML = JSON.stringify(dataGDP);

    // Make the dates in dataGDP date objects
    // dataGDP = dataGDP.map((x) => {
    //   tmp = x[0].split("-");
    //   tmp = tmp.map((y) => parseInt(y));
    //   return [new Date(tmp[0], tmp[1], tmp[2]), x[1]];
    // });

    let timeParse = d3.timeParse("%Y-%m-%d");

    // Make a function for formatting the time pretty
    let pTime = d3.timeFormat("%B %Y");

    //document.getElementById('svg-target').innerHTML = pTime(dataGDP[0][0]);

    // Find limits in the dataset
    xMin = timeParse(dataGDP[0][0]);
    xMax = timeParse(dataGDP[dataGDP.length-1][0]);
    yMin = d3.min(dataGDP, (d) => d[1]);
    yMax = d3.max(dataGDP, (d) => d[1]);
    barWidth = (svgWidth - 2*svgPadding) / dataGDP.length;

    // Define the scales
    const xScale = d3.scaleTime()
      .domain([xMin, xMax])
      .range([svgPadding, svgWidth-svgPadding])

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([svgHeight-svgPadding, svgPadding])

    const heightScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([0, svgHeight-2*svgPadding])

    //document.getElementById('svg-target').innerHTML = xScale(2);

    // Create the SVG plotting area
    const svg = d3.select("#svg-target")
                  .append("svg")
                  .attr('viewBox', '0 0 1000 500')
                  .attr('preserveAspectRatio', 'xMidYMid');
                  // .attr("width", svgWidth)
                  // .attr("height", svgHeight);

    // Make axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeYear.every(5));

    svg.append("g")
      .attr("transform", "translate(0, " + (svgHeight - svgPadding) + ")")
      .attr("id", "x-axis")
      .call(xAxis);

    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
       .attr("transform", "translate(" + (svgPadding) + ",0)")
       .attr("id", "y-axis")
       .call(yAxis);

    // Define the tooltip
    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // Plot the bars
    svg.selectAll("rect")
      .data(dataGDP)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(timeParse(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => heightScale(d[1]))
      .attr("class", "bar")
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .on("mouseover", function(d){
          tooltip.transition()
              .duration(200)
              .style("opacity", 0.8);
          tooltip.html(pTime(timeParse(d[0]))+": "+d[1]+" Billions")
              .style("left", d3.event.pageX + 20 + "px")
              .style("top", d3.event.pageY + 20 + "px");
          tooltip.attr("data-date", d[0]);
      })
      .on("mouseout", function(d){
            tooltip.transition()
                .duration(400)
                .style("opacity", 0);
      });

    // Give the chart a title
    svg.append("text")
        .attr("id", "title")
        .attr("x", (svgWidth / 2))
        .attr("y", svgPadding)
        .attr("text-anchor", "middle")
        .style("font-size", "48px")
        .text("US GDP");

    // Give the chart a y-axis title
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (svgPadding/2) + "," + (svgHeight/2) + ")rotate(-90)")
        .text("GDP (Billions of Dollars)")

  }
})

/*
vis.append("text")
  .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
  .attr("transform", "translate("+ (padding/2) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
  .text("Value");

vis.append("text")
  .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
  .attr("transform", "translate("+ (width/2) +","+(height-(padding/3))+")")  // centre below axis
  .text("Date");
*/

/*
2020/04/18
The JSON is formatted as an object with the following keys:
  errors
  id
  source_name
  source_code
  code
  name
  urlize_name
  display_url
  description
  updated_at
  frequency
  from_date
  to_date
  column_names
  private
  type
  premium
  data

data is a list of list:
  [["1947-01-01",243.1],["1947-04-01",246.3],...,["2015-07-01",18064.7]]


*/
