var request = require( 'request-promise' )
  , geocode = require( './lib/geocode' )

const
  OFFICE_TITLES = {
    Del: 'Delegate',
    Sen: 'Senator',
    Rep: 'Representative'
  },

  STATE_FIELDS = [
    'full_name',
    'party',
    'chamber'
  ]


module.exports = function reps( address ) {
  return new Promise( function( resolve, reject ) {
    geocode( address )
      .then( g => [ federalReps( g.lat, g.lng ), stateReps( g.state, g.lat, g.lng ) ])
      .then( ps => Promise.all( ps ))
      .then( results => resolve({
        federal: results[0],
        state: results[1]
      }))
  })
};


function federalReps( lat, lng ) {
  return request({
    uri: 'https://congress.api.sunlightfoundation.com/legislators/locate',
    qs: {
      latitude: lat,
      longitude: lng
    }
  })
  .then( JSON.parse )
  .then( r => r.results )
  .then( reps => reps.map( r => ({
    name: `${r.first_name} ${r.last_name}`,
    office: OFFICE_TITLES[ r.title ],
    party: r.party
  })))
}


function stateReps( state, lat, lng ) {
  return request({
    uri: 'https://openstates.org/api/v1/legislators/geo/',
    qs: {
      lat,
      long: lng
    }
  })
  .then( JSON.parse )
  .then( reps => reps.map( rep => (
    STATE_FIELDS.reduce(( m, field ) => Object.assign( {}, m,
      {[ field ]: rep[ field ] }
    ), {})
  )))
}
