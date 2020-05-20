path_map_data = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
path_education_data = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

// Width and height
let chart_width = 1000;
let chart_height = 800;
let scale_factor = 0.8;
let padding = 100;

// Set up the map
d3.json(path_map_data).then(function(map){
  d3.json(path_education_data).then(function(data){
    DrawMap(map, data);
  })
});

// 
function DrawMap(map, data){
  
  // Set up the color scale to use for the fill
  let colorScale = d3.scaleLinear()
  .domain([
    d3.min(data, (d) => {
      return d.bachelorsOrHigher;
    }), 
    d3.max(data, (d) => {
      return d.bachelorsOrHigher;
    })
  ])
  .range(["white", "#00b56a"]);
  
  // let projection = d3.geoAlbers()
  //   .scale([ chart_width ])
  //   .translate([ chart_width / 2, chart_height / 2 ]);
  let path = d3.geoPath()
    .projection(d3.geoTransform({
      point: function(x, y) {
        this.stream.point((x * scale_factor)+padding, (y * scale_factor)+padding);
      }
    }));
  
  let svg = d3.select("#container")
    .attr("id", "chart")
    .append('svg')
    .attr("width", chart_width)
    .attr("height", chart_height);
  
  // Set up the graph and counties
  let map_group = svg.selectAll('g')
    .data(topojson.feature(map, map.objects.counties).features)
    .enter()
    .append('g')
    .attr('class', 'county')
    .attr('data-fips', (d) => {
      let county_match = data.filter(function(x){
        return x.fips == d.id;
      });
      return(county_match[0].fips);
    })
    .attr('data-education', (d) => {
      let county_match = data.filter(function(x){
        return x.fips == d.id;
      });
      return(county_match[0].bachelorsOrHigher);
    })
    .attr("fill", (d) => {
      let county_match = data.filter(function(x){
        return x.fips == d.id;
      });
      return(colorScale(county_match[0].bachelorsOrHigher));
    })
    .on('mouseover', function(d){
      let education = d3.select(this).attr('data-education');
      console.log(education);
      d3.select(this)
        .attr('fill', 'black');
      d3.select('#tooltip')
        .attr('data-education', education)
        .style('left', (d3.event.pageX + 25) + "px")
        .style('top', (d3.event.pageY - 50) + "px")
        .style('opacity', 0.9)
        .html(function(){
          let item = data.filter(function(x){
            return x.fips == d.id;
          });
          if (item[0]) {
            return(item[0].area_name + ", " + item[0].state + 
                  " : " + item[0].bachelorsOrHigher + "%" )
          }
          else {
            return "No information.";
          };
        });
    })
    .on('mouseout', function(d){
      d3.select(this)
        .attr('fill', function(){
          let county_match = data.filter(function(x){
            return x.fips == d.id;
          });
          return(colorScale(county_match[0].bachelorsOrHigher));
      });
      d3.select("#tooltip")
        .style('opacity', 0);
    });
  
  // Setup the legend
  let legendArr = d3.range(101);
  let legendColor = d3.scaleLinear()
    .domain([0,100])
    .range(colorScale.domain());
  
  // Draw the legend
  let legendAxisScale = d3.scaleLinear().domain([0,100]).range([0,200]);
  let legendAxis = d3.axisBottom(legendAxisScale)
    .ticks(5)
    .tickFormat((d) => legendColor(d).toFixed(2));
  svg.append('g')
    .call(legendAxis)
    .attr(
      'transform',
      'translate(' + ((chart_width/2) - 100) + ',' + (80+(padding/4)) +')'
    );
  
  svg.append('g')
    .attr('id', 'legend')
    .selectAll('rect')
    .data(legendArr)
    .enter()
    .append('rect')
    .attr('height', (padding/4))
    .attr('width', 2)
    .attr('x', (d) => (chart_width/2) - 100 + 2*d)
    .attr('y', (d) => 80)
    .attr('fill', (d) => colorScale(legendColor(d)));
  
  // Draw the map
  let map_areas = map_group.append('path')
    .attr('d', path)
    .attr('class', 'area');
  
  // Draw the state outlines
  svg.append("path")
      .datum(topojson.mesh(map, map.objects.states, function(a, b) { 
        return a !== b; 
      }))
      .attr("class", "states")
      .attr("d", path);
  
  // Give the chart a title
  svg.append("text")
    .attr("id", "title")
    .attr("x", (chart_width / 2))
    .attr("y", (padding / 3))
    .attr("text-anchor", "middle")
    .style("font-size", "32px")
    .text("United States College Graduates");
  
  // Give the chart a subtitle
  svg.append("text")
    .attr("id", "description")
    .attr("x", (chart_width / 2))
    .attr("y", ( padding / 2))
    .attr("alignment-baseline", "text-before-edge")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');
}