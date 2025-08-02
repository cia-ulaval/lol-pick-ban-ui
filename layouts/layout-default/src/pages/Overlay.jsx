import React from 'react';
import cx from 'classnames';
import Pick from "./Pick";
import Ban from "./Ban";
import css from './style/index.module.scss';
import logo from '../assets/Logo_asetin.png';

export default class Overlay extends React.Component {
    state = {
        currentAnimationState: css.TheAbsoluteVoid,
        openingAnimationPlayed: false,
        audio: null,
        musicList: []
    };
    
    componentDidMount() {
        if(this.props.config.frontend.audioEnabled) {
            document.addEventListener("click", this.enableAudio);
        }
        fetch('./music-list.json')
            .then(response => response.json())
            .then(async musicList => await this.setState({musicList: musicList}))
            .catch(error => console.error("Erreur de chargement de la musique :", error));
    }
    
    enableAudio = () => {
        if (!this.state.audio && this.state.musicList.length > 0 && this.state.openingAnimationPlayed) {
            const randomMusic = this.state.musicList[Math.floor(Math.random() * this.state.musicList.length)];
            const audio = new Audio(`./music/${randomMusic}`);
            
            audio.volume = 0.25;
            audio.loop = true;
            
            audio.play().catch(err => console.error("Erreur de lecture audio:", err));
            
            this.setState({ audio });
            
            document.removeEventListener("click", this.enableAudio);
            document.addEventListener("click", this.stopAudio);
            document.addEventListener("dblclick", this.changeSong);
        }
    }
    
    stopAudio = () => {
        if (this.state.audio) {
            this.state.audio.pause();
        }
        document.addEventListener("click", this.restartAudio);
        document.removeEventListener("click", this.stopAudio);
    }
    
    restartAudio = () => {
        if (this.state.audio) {
            this.state.audio.play();
        }
        document.removeEventListener("click", this.restartAudio);
        document.addEventListener("click", this.stopAudio);
    }
    
    changeSong = () => {
        if (this.state.audio) {
            this.state.audio.pause();
            this.state.audio = null;
        }
        this.enableAudio();
    }
    
    playOpeningAnimation() {
        this.setState({openingAnimationPlayed: true});
        
        setTimeout(() => {
            this.setState({currentAnimationState: css.AnimationHidden});

            setTimeout(() => {
                this.setState({currentAnimationState: css.AnimationTimer + ' ' + css.AnimationBansPick});

                setTimeout(() => {
                    this.setState({currentAnimationState: css.AnimationBansPick + ' ' + css.AnimationBansPickOnly});

                    setTimeout(() => {
                        this.setState({currentAnimationState: css.AnimationPigs});
                    }, 1000);
                }, 1450);
            }, 700);
        }, 500);
    }
    
    render() {
        const { state, config } = this.props;
        
        let pickCount = 1;
        
        if(config.frontend.format === '2v2') {
            pickCount = 2;
        } else if(config.frontend.format === '3v3') {
            pickCount = 3;
        }

        if (state.champSelectActive && !this.state.openingAnimationPlayed) {
            this.playOpeningAnimation();
        }

        if (!state.champSelectActive && this.state.openingAnimationPlayed) {
            this.setState({openingAnimationPlayed: false});
            this.setState({currentAnimationState: css.TheAbsoluteVoid});
        }
        
        const renderBans = (teamState) => {
            const list = teamState.bans.slice(0, 3).map((ban, idx) => <Ban key={`ban-${idx}`} {...ban} />);
            return <div className={cx(css.BansBox)}>{list}</div>;
        };

        const renderTeam = (teamName, teamConfig, teamState) => (
            <div className={cx(css.Team, teamName)}>
                <div className={cx(css.Picks)}>
                    {teamState.picks.map((pick, idx) => idx < pickCount ? <Pick key={`pick-${idx}`} config={this.props.config} {...pick} /> : '')}
                </div>
                <div className={css.BansWrapper}>
                    <div className={cx(css.Bans, {[css.WithScore]: config.frontend.scoreEnabled})}>
                        {teamName === css.TeamBlue && config.frontend.scoreEnabled && <div className={css.TeamScore}>
                            {teamConfig.score}
                        </div>}
                        {teamName === css.TeamRed && renderBans(teamState)}
                        <div className={cx(css.TeamName, {[css.WithoutCoaches]: !config.frontend.coachesEnabled})}>
                            {teamConfig.name}
                            {config.frontend.coachesEnabled && <div className={css.CoachName}>
                                Coach: {teamConfig.coach}
                            </div>}
                        </div>
                        {teamName === css.TeamBlue && renderBans(teamState)}
                        {teamName === css.TeamRed && config.frontend.scoreEnabled && <div className={css.TeamScore}>
                            {teamConfig.score}
                        </div>}
                    </div>
                </div>
            </div>
        );

        return (
            <div className={cx(css.Overlay, ["2v2", "3v3"].includes(config.frontend.format) ? `${css[`Root--${config.frontend.format}`]}` : "", css.Root, this.state.currentAnimationState)} style={{"--color-red": config.frontend.redTeam.color, "--color-blue": config.frontend.blueTeam.color}}>
                {Object.keys(state).length === 0 && <div className={cx(css.infoBox)}>Not connected to backend service!</div>}
                {Object.keys(state).length !== 0 &&
                <div className={cx(css.ChampSelect)}>
                    {!state.leagueConnected && <div className={cx(css.infoBox)}>Not connected to client!</div> }
                    <div className={cx(css.MiddleBox)}>
                        <div className={cx(css.Logo)}>
                            <img src={logo} alt="Logo" />
                        </div>
                        <div className={cx(css.Patch)}>
                            {state.state}
                        </div>
                        <div className={cx(css.Timer, {
                            [`${css.Red} ${css.Blue}`]: !state.blueTeam.isActive && !state.redTeam.isActive,
                            [css.Blue]: state.blueTeam.isActive,
                            [css.Red]: state.redTeam.isActive
                        })}>
                            <div className={cx(css.Background, css.Blue)} />
                            <div className={cx(css.Background, css.Red)} />
                            {state.timer < 100 && <div className={cx(css.TimerChars)}>
                                {state.timer.toString().split('').map((char, idx) => <div key={`div-${idx}`}
                                    className={cx(css.TimerChar)}>{char}</div>)}
                            </div>}
                            {state.timer >= 100 && <div className={cx(css.TimerChars)}>
                                {state.timer}
                            </div>}
                        </div>
                    </div>
                    {renderTeam(css.TeamBlue, config.frontend.blueTeam, state.blueTeam)}
                    {renderTeam(css.TeamRed, config.frontend.redTeam, state.redTeam)}
                </div>}
            </div>
        )
    }
}
