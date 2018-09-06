import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import Particles from 'react-particles-js'
import './App.css';

const particleOptions = {
	particles: {
		number: {
			value: 30,
			density: {
				enable: true,
				value_area: 800
			}
		}
	}
}


const initailState = {
	input: '',
	imageUrl: '',
	box: {},
	route: 'signin',
	isSignedIn: false,
	user: {
		id: '',
		email: '',
		name: '',
		entries: '',
		joined: ''
	}
}

class App extends Component {
	constructor() {
		super();
		this.state = initailState
	}

	loadUser = (data) => {
		this.setState({
			user: {
				id: data.id,
				email: data.email,
				name: data.name,
				entries: data.entries,
				joined: data.joined
			}
		})
	}

	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputimage');
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFace.left_col * width,
			topRow: clarifaiFace.top_row * height,
			rightCol: width - (clarifaiFace.right_col * width),
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		this.setState({ box: box })
	}

	onInputChange = (e) => {
		this.setState({ input: e.target.value })
	}

	onSubmit = () => {
		this.setState({ imageUrl: this.state.input })
		fetch(process.env.REACT_APP_API_URL + '/imageurl', {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				input: this.state.input
			})
		})
		.then(resp => resp.json())
		.then(resp => {
			if(resp) {
				fetch(process.env.REACT_APP_API_URL + '/image', {
					method: 'put',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: this.state.user.id
					})
				})
				.then(response => response.json())
				.then(count => {
					this.setState(Object.assign(this.state.user, { entries: count }))
				})
				.catch(err => console.log(err))
			}
			this.displayFaceBox(this.calculateFaceLocation(resp))
		})
		.catch(err => console.log(err));
	}

	onRouteChange = (route) => {
		if (route === 'signout') {
			this.setState(initailState)
		} else if (route === 'home') {
			this.setState({ isSignedIn: true })
		}

		this.setState({ route: route })

	}

	render() {
		const { isSignedIn, imageUrl, box, route } = this.state;
		return (
			<div className="App">
				<Particles 
					className="particles"
					params={ particleOptions }
				/>
				<Navigation 
					isSignedIn={ isSignedIn }
					onRouteChange={ this.onRouteChange }
				/>
				
				{ route === 'home'
					? <div>
						<Logo />
						<Rank 
							name={ this.state.user.name } 
							entries={ this.state.user.entries } />
						<ImageLinkForm 
							onInputChange={ this.onInputChange }
							onSubmit={ this.onSubmit }
						/>
						<FaceRecognition 
							box={box}
							imageUrl={ imageUrl }
						/>
					</div>
					: (
						route === 'signin'
							? <Signin 
								loadUser={ this.loadUser }
								onRouteChange={ this.onRouteChange } />
							: <Register 
								loadUser={ this.loadUser }
								onRouteChange={ this.onRouteChange } 
							/>
					)
				}
			</div>
		);
	}
}

export default App;