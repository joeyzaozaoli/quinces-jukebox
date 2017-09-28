import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import SearchEntry from './SearchEntry';
import { Route } from 'react-router-dom';
import Login from './Login';

class Search extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      query: '',
      results: [],
      users: [],
      currentUser: ''
    }
    this.onSearch = this.onSearch.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onAdd = this.onAdd.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.menuItems = this.menuItems.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
  }

  componentDidMount() {
    this.getAllUsers();
  }

  onSearch(query){
    axios.get('/songs/search', {
      params: {
        query: this.state.query
      }
    })
    .then((response) => {
      this.setState({ results: response.data.tracks.items});
    })
    .catch((err) => {
      console.error.bind(err);
    })
  }

  onChange(e) {
    let query = e.target.value;
    this.setState({query:query});
  }

  onAdd(song) {
    let newSong = {};
    newSong.name = song.name;
    newSong.image = song.album.images[2].url;
    newSong.link = song.album.external_urls.spotify;
    newSong.userName = this.state.currentUser;
    axios.post('/songs', newSong)
    .then((response) => {
      this.props.history.push('/');
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  handleUserChange (user){
    this.setState({currentUser: user});
  };

  menuItems(users) {
    return users.map((user) => (
      <MenuItem
        key={user._id}
        value={user.name}
        primaryText={user.name}
      />
    ));
  }

  getAllUsers() {
    axios.get(`/users`)
    .then((response) => {
      this.setState({
       users: response.data
      })
    })
    .catch((err) => {
      console.error.bind(err);
    })
  }

  render() {
    return (
      <div>
        <Login onChange={this.handleUserChange} users={this.state.users} currentUser={this.state.currentUser}/>
        <TextField onChange={this.onChange}/>
        <button onClick={this.onSearch}>search</button>
        <div>
        {
        this.state.results && this.state.results.map((result) => {
          return (
            <SearchEntry onAdd={this.onAdd} Result={result}/>
          )
        })
      }
      </div>
     </div>
    )
  }
}

export default Search;