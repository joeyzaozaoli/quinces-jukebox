import React from 'react';
import axios from 'axios';
import SpotifyWebApi from 'spotify-web-api-js';
// import { connect } from 'react-redux';
// import { getAllSongs } from '../redux/reducer';
import PlaylistEntry from './PlaylistEntry';
import {GridList, GridTile} from 'material-ui/GridList';
import Player from './Player.js';

const spotifyApi = new SpotifyWebApi();

class Playlist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      songs: [],
      currentSong: '',
      deviceId: ''
    }
    this.getAllSongs = this.getAllSongs.bind(this);
    this.upVote = this.upVote.bind(this);
    this.downVote = this.downVote.bind(this);
    this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
  }

  componentDidMount() {
    this.getSpotifyToken();
    this.getDeviceId();
    this.getAllSongs();
  }

  getAllSongs() {
    axios.get(`/songs`)
    .then((response) => {
      this.setState({
        songs: response.data
      })
    })
    .catch((err) => {
      console.error.bind(err);
    })
  }

  upVote(song) {
    // need to check if song as already been voted
    // on by person
    song.vote = 1;
    axios.put('/song', song)
    .then((response) => {
      this.getAllSongs();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  downVote(song) {
    // need to check if song as already been voted
    // on by person
    song.vote = -1;
    axios.put('/song', song)
    .then((response) => {
      this.getAllSongs();
    })
    .catch((err) => {
      console.log(err);
    })
  }

  //synchronous function that gets token values from url parameters
  getSpotifyToken() {
    const getHashParams = () => {
    let hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g;
    let q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
      return hashParams;
    }

    const params = getHashParams();
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;

    spotifyApi.setAccessToken(access_token);
    return access_token;
  }

  getDeviceId() {
    spotifyApi.getMyDevices()
      .then((data) => {
        this.setState({deviceId : data.devices[0].id})
      }, (err) =>{
        console.error(err);
      });
  }

  playCurrentSong(deviceId) {
    //console.log(this.state.currentSonglink.split['track/'])
    spotifyApi.play({device_id: deviceId, uris: ['spotify:track:' + this.state.currentSong.link.split('track/')[1]]})
      .then(function(data) {
       }.bind(this), function(err) {
         console.error(err);
    });
  };

  handlePlayButtonClick (song) {
    //console.log(song.link.split('track/'));
    console.log('clicked on', song.name)
    this.setState({currentSong: song});
    //console.log(this.state)
    this.playCurrentSong(this.state.deviceId);
  }

  render() {
      return (
        <div>
          {this.state.currentSong && <Player song={this.state.currentSong}/>}
        <GridList
        cellHeight={180}
        cols={1}
        >
        {
          this.state.songs && this.state.songs.map((song, i) => {
            return (

              <PlaylistEntry downVote={this.downVote} handlePlay={this.handlePlayButtonClick} upVote={this.upVote} Song={song} key={i} />
            )
          })
        }
        </GridList>
        </div>
      )
  }
}

export default Playlist;
// REDUX CODE
// const mapState = ({songs}) => ({songs});
// const mapDispatch = {getAllSongs};
// export default connect(mapState, mapDispatch)(Playlist);