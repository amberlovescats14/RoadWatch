//! Just incase the mapbox.js file gets messed up
$(document).ready(function () {
    let key = document.querySelector("#apiKey").content
    mapboxgl.accessToken = key
    
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 9,
        center: [-98.4936, 29.4241]
    })
    
    var markerOptions = {
        color: "#038f07",
        draggable: false
    }
    var markerOptionsUser = {
        color: "blue",
        draggable: false
    }
    
    var marker = new mapboxgl.Marker(markerOptions)
        .setLngLat([-98.4936, 29.4241])
        .addTo(map)
    
    //!GEO CODE
    const geocode = (search, token) => {
        let baseUrl = 'https://api.mapbox.com'
        let endPoint = '/geocoding/v5/mapbox.places/'
        return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
            .then(function (res) {
                return res.json()
                // to get all the data from the request, comment out the following three lines...
            })
            .then(function (data) {
                return data.features[0].center
            })
    }
    
    //! ADD CITY DATA TO ARRAY
    let points = []
    const addCityDataToArray = () => {
        for (let i = 0; i < lowWaterPoints[0].features.length - 1; i++) {
            points.push(lowWaterPoints[0].features[i])
        }
    }
    addCityDataToArray()
    
    
    //! SET CITY MARKERS
    
    const setCityMarkers = () => {
        for (let i = 0; i < points.length - 1 && i < 9; i++) {
            
            const temp = points[i].geometry.coordinates
            
            geocode(temp, key)
                .then(function (cords) {
                    let pops = new mapboxgl.Popup()
                        .setLngLat(cords)
                        .setHTML("<em><h2>" + points[i].properties.Name + "</em></h2>")
                        .addTo(map)
                    let marker = new mapboxgl.Marker(markerOptions)
                        .setLngLat(cords)
                        .setPopup(pops)
                        .togglePopup()
                        .addTo(map)
                })
        }
        
    }
    setCityMarkers()

//!function to add click events
    const addClickEventForEndorsementPost = (arr) => {
        $.each(arr, function (i) {
            $(document).on('click', `#${arr[i]}`, function () {
                let idArray = arr[i].split('-')
                let token = $("meta[name='_csrf']").attr("content");
                $.ajax({
                    url: `/endorsements/${idArray[1]}/${idArray[2]}`,
                    headers: {"X-CSRF-TOKEN": token},
                    type: 'POST',
                    success: function (result) {
                        console.log("SUCCESS")
                    }
                })
            })
        })
    }



//! USER REPORTS
    const fetchUserPoints = () => {
        let userReports
        let request = $.ajax({'url': '/map/json'})
        
        request.done(function (reports) {
            let endorsementButtonIds = []
            userReports = reports
            for (let i = 0; i < userReports.length && i < 9; i++) {
                //push buttons with id's into array
                endorsementButtonIds.push(`endorsement-${userReports[i].id}-1`)
                endorsementButtonIds.push(`endorsement-${userReports[i].id}-2`)
                
                const cord = [parseFloat(userReports[i].longitude), parseFloat(userReports[i].latitude)]
                geocode(cord, key)
                    .then(function (cords) {
                        let html = `
            <em><h2>${userReports[i].description}</h2></em>
            <button id="endorsement-${userReports[i].id}-1"
            class="btn btn-outline-primary btn-sm">
            Still happening</button>
             <button id="endorsement-${userReports[i].id}-2"
             class="btn btn-outline-primary btn-sm">
             Incident cleared</button>
            `
                        let pops = new mapboxgl.Popup()
                            .setLngLat(cords)
                            .setHTML(html)
                            .addTo(map)
                        let marker = new mapboxgl.Marker(markerOptionsUser)
                            .setLngLat(cords)
                            .setPopup(pops)
                            .togglePopup()
                            .addTo(map)
                        
                        
                    })
            }
            addClickEventForEndorsementPost(endorsementButtonIds)
        })
    }
    
    fetchUserPoints()
    
    //! FLY TO FUNCTION
    const flyToFunc = (search) => {
        geocode(search, key)
            .then(function (result) {
                map.flyTo({center: result})
            })
    }
    
    $(document).on('click', '#zipcode-button', function (e) {
        let input = $('#zipcode-input')
        flyToFunc(input.val())
    })
    
    
    
    
    
    
})
