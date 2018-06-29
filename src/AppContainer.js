import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import escapeRegExp from 'escape-string-regexp'
import sortBy from 'sort-by'


let markers = [];
let infoWindows = [];

export default class AppContainer extends Component {
  constructor(props){
    super(props);
    this.openMarker = this.openMarker.bind(this);

    this.state = {
      locations: [
        { name: "Kungliga Slottet", location: {lat: 59.3268215, lng: 18.0717194} },
        { name: "Djurgården Island", location: {lat: 59.326284, lng: 18.1132151} },
        { name: "Gröna Lund", location: {lat: 59.3233564, lng: 18.0963901} },
        { name: "Kungliga Operan", location: {lat: 59.3296484, lng: 18.0700013} },
        { name: "Kungliga National Stads Parken", location: {lat: 59.3267016, lng: 18.1267892} },
        { name: "Moderna Museet", location: {lat: 59.3260466, lng: 18.0846878} },
        { name: "Museu do Vasa", location: {lat: 59.3280233, lng: 18.0913964} },
        { name: "Gamla stan", location: {lat: 59.3256984, lng: 18.0718788} }
      ],
      map: {},
      query: ''
    }
  }

  updatequery = (query) => {
    this.setState({ query: query})
  }

  componentDidMount() {
    this.loadMap(); 
  }

/* Load Map using react-google-maps*/

  loadMap() {
    if (this.props && this.props.google) { 
      const {google} = this.props; 
      const maps = google.maps; 

      const mapRef = this.refs.map; 
      const node = ReactDOM.findDOMNode(mapRef); 

      const mapConfig = Object.assign({}, {
        center: {lat: 59.3293235, lng: 18.0685808}, 
        zoom: 11, 
        mapTypeId: 'roadmap' 
      })

      var map = new maps.Map(node, mapConfig); 
      this.setState({map: map});

      /*Add info windows and content to map*/
      this.state.locations.forEach( location => { 
        let contentString = 
        `<div id="infoWindow" tabIndex="0">
        <h1>${location.name}</h1>
        <p>address: test</p>
        <a href="">Click Here For More Info</a>
        </div>`;

        let infoWindow = new google.maps.InfoWindow({
          content: contentString,
          name: location.name
        });

        let bounds = new google.maps.LatLngBounds();

        /*Add markers to map*/
        let marker = new google.maps.Marker({
          map: map,
          position: {lat: location.location.lat, lng: location.location.lng},  
          animation: window.google.maps.Animation.DROP,
          title: location.name 
        });

        markers.push(marker);
        infoWindows.push(infoWindow);

        /*Add click listenr and animation on marker when openinig info windows*/

        marker.addListener('click', function() {
          infoWindows.forEach(info => {info.close() });
            infoWindow.open(map, marker);
            if(marker.getAnimation() !== null){
              marker.setAnimation(null);
            } else {
              marker.setAnimation(window.google.maps.Animation.BOUNCE)
              setTimeout(()=> {marker.setAnimation(null);}, 300)
            }
        });

        markers.forEach((m) => bounds.extend(m.position))
        map.fitBounds(bounds)
      })
    }
  }


  /*Add animation on marker and openinig info windows when a list item clicked*/
  openMarker(e) {
    markers.map(marker => {
      if (e.target.value === marker.title) {
        infoWindows.map(infoWindow => {
          if (marker.title === infoWindow.name) {
            console.log(infoWindow.name);
            infoWindows.forEach(info => {info.close() });
            infoWindow.open(this.props.map, marker);
            if(marker.getAnimation() !== null){
            marker.setAnimation(null);
            } else {
            marker.setAnimation(window.google.maps.Animation.BOUNCE)
            setTimeout(()=> {marker.setAnimation(null);}, 300)
            }
          }
        })
      }
    })
  }

  render() {
  /*filter list items depending on user entry*/
    const {locations, query} = this.state;
    let filteredLocations
    if(query){
      const match = new RegExp(escapeRegExp(query), 'i')
      filteredLocations = locations.filter((location)=> match.test(location.name))
    } else {
      filteredLocations = locations
    }
    filteredLocations.sort(sortBy('name'))

    return ( 
      <div className="container" role="main">
      <div id="listView-container" role="contentinfo" tabIndex="-1">
        

        <div id="listView" aria-label="Best Places to Visit in Stockholm">
          <h1 id="listView-header" tabIndex="0 ">Best Places to Visit in Stockholm </h1>
          
          <input id="search"
            placeholder="Search For Places to Visit"
            value= {query}
            onChange = {(event)=> this.updatequery(event.target.value)}
            role="Search"
            tabIndex="0"
            aria-labelledby="Search For Places to Visit"/>

          <ul id="listView-content" aria-labelledby="list of locations" tabIndex="1">
          
            {filteredLocations.map((location,index) => {
              return(
                <li key={index} tabIndex={index+2} >
                  <button className="button" type="button" 
                   aria-label="View details"
                    onClick={this.openMarker} value={location.name}>
                    {location.name}
                   </button>
                </li>
              )    
            })}
          </ul>
        </div>
        </div>
        <div id="map-container" role="application" tabIndex="-1">

        <div id="map"  ref="map" aria-label="Best Places to Visit in Stockholm" >
          loading map...
        </div>
        </div>
      </div>
    )
  }
}