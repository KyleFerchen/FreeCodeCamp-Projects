// Define variables
url_path = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

let GetYear = d3.timeParse("%Y");
let GetTime = d3.timeParse("%M:%S");
let YTimeTickFormat = d3.timeFormat("%M:%S");

function BuildGraph(data){
  // Define initial variables
  let chart_width = 1000;
  let chart_height = 600;
  let padding = 100;

  // Create the svg element to contain the plot
  let svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', '0 0 1000 600')
    .attr('preserveAspectRatio', 'xMidYMid');

  // Create Scales
  let min_x_value = d3.min(data, (d) => GetYear(d.Year)).getTime();
  let max_x_value = d3.max(data, (d) => GetYear(d.Year)).getTime();
  let x_padding = 0.05 * (max_x_value-min_x_value);
  let min_y_value = d3.min(data, (d) => GetTime(d.Time)).getTime();
  let max_y_value = d3.max(data, (d) => GetTime(d.Time)).getTime();
  let y_padding = 0.05 * (max_y_value-min_y_value);

  let x_scale = d3.scaleTime()
    .domain([
      min_x_value - x_padding,
      max_x_value + x_padding
    ])
    .range([ padding, chart_width-padding ]);

  let y_scale = d3.scaleTime()
    .domain([
      min_y_value - y_padding,
      max_y_value + y_padding
    ])
    .range([ padding, chart_height-padding]);

  // Create Circles for the scatterplot
  svg.selectAll('circle')
    .data( data )
    .enter()
    .append('circle')
    .attr('cx', (d) => x_scale(GetYear(d.Year)))
    .attr('cy', (d) => y_scale(GetTime(d.Time)))
    .attr('r', 10)
    .attr('fill', (d) =>{
      return d.Doping == "" ? "#2bb34d" : "#c93232";
    })
    .attr('opacity', 0.7)
    .classed("dot", true)
    .attr("data-xvalue", (d) => GetYear(d.Year))
    .attr("data-yvalue", (d) => GetTime(d.Time))
    .on('mouseover', function(d){
      var x = parseFloat(d3.select(this).attr('cx'));
      var y = parseFloat(d3.select(this).attr('cy')) - 25;
      var dYear = GetYear(d.Year);

      if (x > (chart_width / 2)){
        x -= 350;
      } else {
        x += 25;
      }

      let tooltipMessage = "";

      if (d.Doping != ""){
        tooltipMessage = d.Name + " (" + d.Nationality +")" +
          "<br>" +
          "Year: " + d.Year + ", Time: " + d.Time +
          "<br>" +
          "<br>" +
          d.Doping;
      } else{
        tooltipMessage = d.Name + " (" + d.Nationality +")" +
          "<br>" +
          "Year: " + d.Year + ", Time: " + d.Time +
          "<br>" +
          "<br>" +
          "Clean record for race!";
      }

      d3.select('#tooltip')
        .attr('data-year', dYear)
        .style('left', x+'px')
        .style('top', y+'px')
        .style('display', 'block')
        .html( tooltipMessage );
      })
    .on('mouseout', function(){
      d3.select('#tooltip')
        .style('display', 'none');
    });

  // Create the axes
  let x_axis = d3.axisBottom(x_scale);
  svg.append('g')
    .style("font", "14px times")
    .attr('id', 'x-axis')
    .attr(
      'transform',
      'translate(0,'+ (chart_height - padding) + ')'
    )
    .call(x_axis);

  let y_axis = d3.axisLeft(y_scale)
    .ticks(5)
    .tickFormat(function(d){
      return(YTimeTickFormat(d));
    });
  svg.append('g')
    .style("font", "14px times")
    .attr('id', 'y-axis')
    .attr(
      'transform',
      'translate(' + padding + ',0)')
    .call(y_axis);

    // Give the chart a title
    svg.append("text")
      .attr("id", "title")
      .attr("x", (chart_width / 2))
      .attr("y", (padding / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "32px")
      .text("Doping in Professional Bicycle Racing");

    // Give the chart a y-axis title
    svg.append("text")
      .style("font-size", "24px")
      .attr("text-anchor", "middle")
      .attr("transform", "translate(" + (padding/3) + "," + (chart_height/2) + ")rotate(-90)")
      .text("Time (Minutes)")

    // Give the chart a legend
    let legend = svg.append('g')
      .attr('id', 'legend');
    legend.append('rect')
      .attr('width', (chart_width / 50))
      .attr('height', (chart_width / 50))
      .attr('fill', "#2bb34d")
      .attr('opacity', 0.7)
      .attr('x', chart_width - (chart_width / 25))
      .attr('y', chart_width / 10);
    legend.append('text')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'text-before-edge')
      .style("font-size", "20px")
      .attr('transform', 'translate('+
            (chart_width - (3 * chart_width / 50)) + ',' +
            (chart_width / 10) + ')')
      .text("Clean Record");
    legend.append('rect')
      .attr('width', (chart_width / 50))
      .attr('height', (chart_width / 50))
      .attr('fill', "#c93232")
      .attr('opacity', 0.7)
      .attr('x', chart_width - (chart_width / 25))
      .attr('y', 6.5 * chart_width / 50);
    legend.append('text')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'text-before-edge')
      .style("font-size", "20px")
      .attr('transform', 'translate('+
            (chart_width - (3 * chart_width / 50)) + ',' +
            (6.5 * chart_width / 50) + ')')
      .text("Doping Allegation");
}

// Load the data
document.addEventListener('DOMContentLoaded', function(){
  const req = new XMLHttpRequest();
  req.open("GET", url_path, true);
  req.send();
  req.onload = function(){
    const json = JSON.parse(req.responseText);

    BuildGraph(json);
  }
});
