import { Component, h } from "preact";
import HCaptcha from "@hcaptcha/react-hcaptcha";

type GameOverProps = {
	width: number | string;
	height: number | string;
	newHighScore: boolean;
	highScore: number;
	score: number;
};

export default class GameOver extends Component<GameOverProps> {
	render() {
		return (
			<div
				id="GameBoard"
				style={{
					width: this.props.width,
					height: this.props.height,
					borderWidth:
						typeof this.props.width == "number"
							? this.props.width / 50
							: null,
				}}
			>
				<div
					id="GameOver"
					style={{
						fontSize:
							typeof this.props.width == "number"
								? this.props.width / 15
								: null,
					}}
				>
					<div id="GameOverText">GAME OVER</div>
					<HCaptcha
						sitekey={
							process.env.PREACT_APP_HCAPTCHA_SITE_KEY
								? process.env.PREACT_APP_HCAPTCHA_SITE_KEY
								: ""
						}
					/>
					<div>Your score: {this.props.score}</div>
					<div>
						{this.props.newHighScore ? "New local " : "Local "}high
						score: {this.props.highScore}
					</div>
					<div id="PressSpaceText">Press Space to restart</div>
				</div>
			</div>
		);
	}
}
