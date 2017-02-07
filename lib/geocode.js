const
  request = require( 'request-promise' );

module.exports = geocode;

function geocode( address ) {
  return request({
    uri: 'https://maps.googleapis.com/maps/api/geocode/json',
    qs: {
      key: 'AIzaSyDyXJFOhGjQk8UeAc0mJfzEBS64IhnqTis',
      address: address
    }
  })
  .then( JSON.parse )
  // .then( g => console.log( g.results[0].address_components ))
  .then( g => ({
    lat: latlng( g ).lat,
    lng: latlng( g ).lng,
    state: state( g )
  }))
}


function latlng( g ) {
  return g.results[0].geometry.location
}

function state( g ) {
  return g.results[0].address_components
    .find( ac => ac.types.some( t => t === 'administrative_area_level_1') &&
                 ac.types.some( t => t === 'political'))
    .long_name
}
