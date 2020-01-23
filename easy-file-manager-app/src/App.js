import React from 'react';
import './App.css';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

function App() {
	return (
		<div className="App">
			<Explorer/>
		</div>
	);
}

class Explorer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			isLoaded: false
		};
		this.files = null;
		this.path = "/";
		this.changeDirectory = this.changeDirectory.bind(this);
		this.upDirectory = this.upDirectory.bind(this);
		this.rootDirectory = this.rootDirectory.bind(this);
		this.refreshDirectory = this.refreshDirectory.bind(this);
	}
	
	componentDidMount(){
		this.changeDirectory();
	}
	
	changeDirectory(dirName){
		this.files = null;
		if(!dirName){
			this.path = "/";
		}else{
			this.path = dirName.replace(/\/\//g,'/');
		}
		this.setState({
			error: null,
			isLoaded: false
		});
		fetch("/listFiles?path=" + this.path)
			.then(async (result) => {
				this.files = await result.json();
				this.setState({
					isLoaded: true,
				});
			},
			(error) => {
				this.setState({
					isLoaded: true,
					error
				});
			});
	}
	
	upDirectory(){
		let upDir = /(.*)\/./.exec(this.path);
		if(!upDir){
			upDir = "/";
		}else{
			upDir = upDir[1];
		}
		this.changeDirectory(upDir);
	}
	
	rootDirectory(){
		this.changeDirectory("/");
	}
	
	refreshDirectory(){
		this.changeDirectory(this.path);
	}
	
	render(){
		let controlPanel = (<ControlPanel onClickBack={this.upDirectory} onClickRoot={this.rootDirectory} onClickRefresh={this.refreshDirectory} path={this.path}/>);
		if(this.state.isLoaded && this.state.error){
			return (<div>{this.state.error}</div>);
		}else{
			if(this.files == null){
				return (<div>{controlPanel}<p><img alt="load" src="/load.svg"/></p></div>);
			}else{
				if(this.files.length){
					return (<div>{controlPanel}<div className="filesList">
						{this.files.map((item) => item.dir ? <Directory key={item.name} name={item.name} onClick={() => this.changeDirectory(this.path + "/" + item.name)}/> : <File key={item.name} name={item.name} filePath={this.path + "/" + item.name}/>)}
						</div></div>);
				}else{
					return (<div>{controlPanel}<p>Empty directory</p></div>);
				}
			}
		}
	}
}

class File extends React.Component {
	constructor(props) {
		super(props);
		this.filePath = this.props.filePath;
		this.state = {
			imagePopup: '',
			isOpen: false,
			loadingProgress: false
		};
	}
	render(){
		let format = /\.([0-9a-z]+)$/.exec(this.props.name);
		if(format == null){
			format = "";
		}else{
			format = format[1].toLowerCase();
		}
		switch(format){
			case "jpg":
			case "jpeg":
			case "png":
			case "gif":
				const { imagePopup, isOpen } = this.state;
				return (<p onClick={() => this.setState({ isOpen: true, imagePopup: "/getFile?path=" + this.filePath })}><img src={"/getThumb?path=" + this.filePath} alt="Thumb"/><span>{this.props.name}</span>
				{isOpen && (<Lightbox mainSrc={imagePopup} onCloseRequest={() => this.setState({ isOpen: false })}/>)}
				
				</p>);
			case "mp3":
			case "wav":
				return (<p onClick={()=>{
					this.setState({loadingProgress: true});
					fetch("/getFile?path=" + this.filePath, {
							method: 'GET'
					}).then(async (result) => {
						const data = URL.createObjectURL(await result.blob());
						let link = document.createElement('a');
						link.href = data;
						link.download = this.props.name;
						link.click();
						this.setState({loadingProgress: false});
					});
				}}><img alt="Mus" src={this.state.loadingProgress ? "/load.svg" : "/music.svg"}/><span>{this.props.name}</span></p>);
			default:
				return (<p onClick={()=>{
					this.setState({loadingProgress: true});
					fetch("/getFile?path=" + this.filePath, {
							method: 'GET'
					}).then(async (result) => {
						const data = URL.createObjectURL(await result.blob());
						let link = document.createElement('a');
						link.href = data;
						link.download = this.props.name;
						link.click();
						this.setState({loadingProgress: false});
					});
				}}><img alt="File" src={this.state.loadingProgress ? "/load.svg" : "/file.svg"}/><span>{this.props.name}</span></p>);
		}
	}
}

class Directory extends React.Component {
	render(){
		return (<p onClick={this.props.onClick}><img alt="folder" src="/folder.svg"/><span>{this.props.name}</span></p>);
	}
}

class ControlPanel extends React.Component {
	render(){
		return (
			<div className="controlPanel">
				<img onClick={this.props.onClickBack} alt="Back" src="/back.svg"/>
				<img onClick={this.props.onClickRoot} alt="Root" src="/root_folder.svg"/>
				<img onClick={this.props.onClickRefresh} alt="Refresh" src="/refresh.svg"/>
				<input type="text" value={this.props.path} readOnly/>
			</div>
		);
	}
}

export default App;
