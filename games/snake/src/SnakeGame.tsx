import "./Game.css";

import { Component, h } from "preact";

import GameOver from "./GameOver";

type SnakeGameProps = {
	snakeColor?: string;
	appleColor?: string;
	startSnakeSize?: number;
	percentageWidth?: number;
};

type SnakeGameState = {
	width: number;
	height: number;
	blockWidth: number;
	blockHeight: number;
	gameLoopTimeout: number;
	timeout?: NodeJS.Timeout;
	startSnakeSize: number;
	snake: {
		Xpos: number;
		Ypos: number;
	}[];
	apple: {
		Xpos: number;
		Ypos: number;
	};
	direction: "right" | "left" | "down" | "up";
	directionChanged: boolean;
	isGameOver: boolean;
	snakeColor: string;
	appleColor: string;
	score: number;
	highScore: number;
	newHighScore: boolean;
};

export default class SnakeGame extends Component<
	SnakeGameProps,
	SnakeGameState
> {
	constructor(props: SnakeGameProps) {
		super(props);

		this.handleKeyDown = this.handleKeyDown.bind(this);

		this.state = {
			width: 0,
			height: 0,
			blockWidth: 0,
			blockHeight: 0,
			gameLoopTimeout: 50,
			startSnakeSize: 0,
			snake: [],
			apple: {
				Xpos: 0,
				Ypos: 0,
			},
			direction: "right",
			directionChanged: false,
			isGameOver: false,
			snakeColor: this.props.snakeColor || this.getRandomColor(),
			appleColor: this.props.appleColor || this.getRandomColor(),
			score: 0,
			highScore:
				typeof window !== "undefined"
					? Number(localStorage.getItem("snakeHighScore")) || 0
					: 0,
			newHighScore: false,
		};
	}

	componentDidMount() {
		this.initGame();
		if (typeof window !== "undefined")
			window.addEventListener("keydown", this.handleKeyDown);
		this.gameLoop();
	}

	initGame() {
		// Game size initialization
		let percentageWidth = this.props.percentageWidth || 40;
		let width = 0;
		if (typeof document !== "undefined") {
			let width =
				//@ts-ignore
				document.getElementById("GameBoard").parentElement.offsetWidth *
				(percentageWidth / 100);
		}
		width -= width % 30;
		if (width < 30) width = 30;
		let height = (width / 3) * 2;
		let blockWidth = width / 30;
		let blockHeight = height / 20;

		// snake initialization
		let startSnakeSize = this.props.startSnakeSize || 6;
		let snake = [];
		let Xpos = width / 2;
		let Ypos = height / 2;
		let snakeHead = { Xpos: width / 2, Ypos: height / 2 };
		snake.push(snakeHead);
		for (let i = 1; i < startSnakeSize; i++) {
			Xpos -= blockWidth;
			let snakePart = { Xpos: Xpos, Ypos: Ypos };
			snake.push(snakePart);
		}

		// apple position initialization
		let appleXpos =
			Math.floor(
				Math.random() * ((width - blockWidth) / blockWidth + 1)
			) * blockWidth;
		let appleYpos =
			Math.floor(
				Math.random() * ((height - blockHeight) / blockHeight + 1)
			) * blockHeight;
		while (appleYpos === snake[0].Ypos) {
			appleYpos =
				Math.floor(
					Math.random() * ((height - blockHeight) / blockHeight + 1)
				) * blockHeight;
		}

		this.setState({
			width,
			height,
			blockWidth,
			blockHeight,
			startSnakeSize,
			snake,
			apple: { Xpos: appleXpos, Ypos: appleYpos },
		});
	}

	gameLoop() {
		let timeout = setTimeout(() => {
			if (!this.state.isGameOver) {
				this.moveSnake();
				this.tryToEatSnake();
				this.tryToEatApple();
				this.setState({ directionChanged: false });
			}

			this.gameLoop();
		}, this.state.gameLoopTimeout);

		this.setState({ timeout });
	}

	componentWillUnmount() {
		if (this.state.timeout) clearTimeout(this.state.timeout);
		if (typeof window !== "undefined")
			window.removeEventListener("keydown", this.handleKeyDown);
	}

	resetGame() {
		let width = this.state.width;
		let height = this.state.height;
		let blockWidth = this.state.blockWidth;
		let blockHeight = this.state.blockHeight;
		let apple = this.state.apple;

		// snake reset
		let snake = [];
		let Xpos = width / 2;
		let Ypos = height / 2;
		let snakeHead = { Xpos: width / 2, Ypos: height / 2 };
		snake.push(snakeHead);
		for (let i = 1; i < this.state.startSnakeSize; i++) {
			Xpos -= blockWidth;
			let snakePart = { Xpos: Xpos, Ypos: Ypos };
			snake.push(snakePart);
		}

		// apple position reset
		apple.Xpos =
			Math.floor(
				Math.random() * ((width - blockWidth) / blockWidth + 1)
			) * blockWidth;
		apple.Ypos =
			Math.floor(
				Math.random() * ((height - blockHeight) / blockHeight + 1)
			) * blockHeight;
		while (this.isAppleOnSnake(apple.Xpos, apple.Ypos)) {
			apple.Xpos =
				Math.floor(
					Math.random() * ((width - blockWidth) / blockWidth + 1)
				) * blockWidth;
			apple.Ypos =
				Math.floor(
					Math.random() * ((height - blockHeight) / blockHeight + 1)
				) * blockHeight;
		}

		this.setState({
			snake,
			apple,
			direction: "right",
			directionChanged: false,
			isGameOver: false,
			gameLoopTimeout: 50,
			snakeColor: this.getRandomColor(),
			appleColor: this.getRandomColor(),
			score: 0,
			newHighScore: false,
		});
	}

	getRandomColor(): string {
		const hexa: string = "0123456789ABCDEF";
		let color: string = "#";
		for (let i: number = 0; i < 6; i++)
			color += hexa[Math.floor(Math.random() * 16)];
		return color;
	}

	moveSnake() {
		let snake = this.state.snake;
		let previousPartX = this.state.snake[0].Xpos;
		let previousPartY = this.state.snake[0].Ypos;
		let tmpPartX = previousPartX;
		let tmpPartY = previousPartY;
		this.moveHead();
		for (let i = 1; i < snake.length; i++) {
			tmpPartX = snake[i].Xpos;
			tmpPartY = snake[i].Ypos;
			snake[i].Xpos = previousPartX;
			snake[i].Ypos = previousPartY;
			previousPartX = tmpPartX;
			previousPartY = tmpPartY;
		}
		this.setState({ snake });
	}

	tryToEatApple() {
		let snake = this.state.snake;
		let apple = this.state.apple;

		// if the snake's head is on an apple
		if (snake[0].Xpos === apple.Xpos && snake[0].Ypos === apple.Ypos) {
			let width = this.state.width;
			let height = this.state.height;
			let blockWidth = this.state.blockWidth;
			let blockHeight = this.state.blockHeight;
			let newTail = { Xpos: apple.Xpos, Ypos: apple.Ypos };
			let highScore = this.state.highScore;
			let newHighScore = this.state.newHighScore;
			let gameLoopTimeout = this.state.gameLoopTimeout;

			// increase snake size
			snake.push(newTail);

			// create another apple
			apple.Xpos =
				Math.floor(
					Math.random() * ((width - blockWidth) / blockWidth + 1)
				) * blockWidth;
			apple.Ypos =
				Math.floor(
					Math.random() * ((height - blockHeight) / blockHeight + 1)
				) * blockHeight;
			while (this.isAppleOnSnake(apple.Xpos, apple.Ypos)) {
				apple.Xpos =
					Math.floor(
						Math.random() * ((width - blockWidth) / blockWidth + 1)
					) * blockWidth;
				apple.Ypos =
					Math.floor(
						Math.random() *
							((height - blockHeight) / blockHeight + 1)
					) * blockHeight;
			}

			// increment high score if needed
			if (this.state.score === highScore) {
				highScore++;
				if (typeof window !== "undefined")
					localStorage.setItem(
						"snakeHighScore",
						highScore.toString()
					);
				newHighScore = true;
			}

			// decrease the game loop timeout
			if (gameLoopTimeout > 25) gameLoopTimeout -= 0.5;

			this.setState({
				snake,
				apple,
				score: this.state.score + 1,
				highScore,
				newHighScore,
				gameLoopTimeout,
			});
		}
	}

	tryToEatSnake() {
		let snake = this.state.snake;

		for (let i = 1; i < snake.length; i++) {
			if (
				snake[0].Xpos === snake[i].Xpos &&
				snake[0].Ypos === snake[i].Ypos
			)
				this.setState({ isGameOver: true });
		}
	}

	isAppleOnSnake(appleXpos: number, appleYpos: number) {
		let snake = this.state.snake;
		for (let i = 0; i < snake.length; i++) {
			if (appleXpos === snake[i].Xpos && appleYpos === snake[i].Ypos)
				return true;
		}
		return false;
	}

	moveHead() {
		switch (this.state.direction) {
			case "left":
				this.moveHeadLeft();
				break;
			case "up":
				this.moveHeadUp();
				break;
			case "right":
				this.moveHeadRight();
				break;
			default:
				this.moveHeadDown();
		}
	}

	moveHeadLeft() {
		let width: number = this.state.width;
		let blockWidth: number = this.state.blockWidth;
		let snake = this.state.snake;
		snake[0].Xpos =
			snake[0].Xpos <= 0
				? width - blockWidth
				: snake[0].Xpos - blockWidth;
		this.setState({ snake });
	}

	moveHeadUp() {
		let height: number = this.state.height;
		let blockHeight: number = this.state.blockHeight;
		let snake = this.state.snake;
		snake[0].Ypos =
			snake[0].Ypos <= 0
				? height - blockHeight
				: snake[0].Ypos - blockHeight;
		this.setState({ snake });
	}

	moveHeadRight() {
		let width: number = this.state.width;
		let blockWidth: number = this.state.blockWidth;
		let snake = this.state.snake;
		snake[0].Xpos =
			snake[0].Xpos >= width - blockWidth
				? 0
				: snake[0].Xpos + blockWidth;
		this.setState({ snake });
	}

	moveHeadDown() {
		let height: number = this.state.height;
		let blockHeight: number = this.state.blockHeight;
		let snake = this.state.snake;
		snake[0].Ypos =
			snake[0].Ypos >= height - blockHeight
				? 0
				: snake[0].Ypos + blockHeight;
		this.setState({ snake });
	}

	handleKeyDown(event: KeyboardEvent) {
		// if spacebar is pressed to run a new game
		if (this.state.isGameOver && event.keyCode === 32) {
			this.resetGame();
			return;
		}

		if (this.state.directionChanged) return;

		switch (event.keyCode) {
			case 37:
			case 65:
				this.goLeft();
				break;
			case 38:
			case 87:
				this.goUp();
				break;
			case 39:
			case 68:
				this.goRight();
				break;
			case 40:
			case 83:
				this.goDown();
				break;
			default:
		}
		this.setState({ directionChanged: true });
	}

	goLeft() {
		this.setState({
			direction: this.state.direction === "right" ? "right" : "left",
		});
	}

	goUp() {
		this.setState({
			direction: this.state.direction === "down" ? "down" : "up",
		});
	}

	goRight() {
		this.setState({
			direction: this.state.direction === "left" ? "left" : "right",
		});
	}

	goDown() {
		this.setState({
			direction: this.state.direction === "up" ? "up" : "down",
		});
	}

	render() {
		// Game over
		if (this.state.isGameOver) {
			return (
				<GameOver
					width={this.state.width}
					height={this.state.height}
					highScore={this.state.highScore}
					newHighScore={this.state.newHighScore}
					score={this.state.score}
				/>
			);
		}

		return (
			<div
				id="GameBoard"
				style={{
					width: this.state.width,
					height: this.state.height,
					borderWidth: this.state.width / 50,
				}}
			>
				{this.state.snake.map((snakePart, index) => {
					return (
						<div
							key={index}
							className="Block"
							style={{
								width: this.state.blockWidth,
								height: this.state.blockHeight,
								left: snakePart.Xpos,
								top: snakePart.Ypos,
								background: this.state.snakeColor,
							}}
						/>
					);
				})}
				<div
					className="Block"
					style={{
						width: this.state.blockWidth,
						height: this.state.blockHeight,
						left: this.state.apple.Xpos,
						top: this.state.apple.Ypos,
						background: this.state.appleColor,
					}}
				/>
				<div id="Score" style={{ fontSize: this.state.width / 20 }}>
					HIGH-SCORE: {this.state.highScore}
					&ensp;&ensp;&ensp;&ensp;SCORE: {this.state.score}
				</div>
			</div>
		);
	}
}
