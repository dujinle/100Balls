GlobalData = {
	phoneModel:'Normal',
	cdnWebsite: "https://www.enjoymygame.com/",
	cdnFileDefaultPath:"/xiaochengxu/jieqiuqiu/jieqiuqiu.json",
	AudioManager:{
		ButtonClick:0,
		//Ball中的音乐
		BallTouchCup:1,
		BallTouchFloor:2,
		//Cup中的音乐
		CupTouchFloor:3,
		GameFinish:4,
		LevelBell:5,
		CupLevelBell:6,
		AudioEnginMore:8,
		AudioPlays:[]
	},
	//数字更新时间
	TimeActionParam:{
		PauseGameMoveTime:0.3,		//暂停游戏界面的时间
		PropSBAScaleTime:0.3
	},
	RigidBodyTag:{
		ball:2,		//小球的碰撞掩码
		floor:4,	//地板的碰撞掩码
		fallLine:8,	//小球下落的tenser碰撞掩码
		huaDao:16,	//滑道的碰撞掩码
		open:32,	//容器打开的碰撞掩码
		content:64,	//容器壁的碰撞掩码
		cup:128,	//杯子的碰撞掩码
		cupFallLine:256,
		remove:3200	//移除的标记
	},
	GameRunTime:{
		ContentBallsDic:{},
		BallNodesPool:null,
		BaseBallPool:null,
		CupNodesPool:null,
		UpScorePool:null,
		CupNodesDic:{},
		BallAppearNum:0,
		AudioPlayNum:0,
		BallUnFallNum:0,
		CupAbledNum:0,
		BallAbledNum:0,
		TotalScore:0,
		CircleLevel:0,
		CurrentSpeed:0
	},
	GameInfoConfig:{
		audioSupport:1,
		maxScore:0,
		maxLevel:0,
		addCupNum:0,
		shareTimes:0,
		gameStatus:0,
		PropRelive:0,
		juNum:0
	},
	CupConfig:{
		CupColor:['White','Green','Blue','Violet','Red'],
		CupColorDic:{
			White:[255,255,255],
			Green:[65,255,152],
			Blue:[35,164,255],
			Violet:[208,61,234],
			Red:[245,27,68]
		},
		TurnDist:[0,100,762,1300,1962,2500],//根据距离控制方向
		CheckDist:[400,1400,1962],//根据距离控制逻辑 是增加杯子 减少杯子 旋转杯子
		BallInCupPos:[[0,-39],[22,-36],[-22,-36],[24,-14],[2,-17],[-20,-14],[26,8],[3,6],[-20,8],[29,30],[6,28],[-16,30]],
		CupCreatNum:6,
		CupMoveSpeed:100,
		CupMoveMSpeed:800,//杯子的最大旋转速度，超过之后要进行衰减
		CupSpeedArate:0.1,//每三轮速度增加率
		CupBigRate:0.15,
		CupMoveDir:'right',
		CupUpLevel:2
	},
	ContentConfig:{
		left:[
			new cc.v2( -147/32, 349/32),
			new cc.v2( -187/32, 258/32),
			new cc.v2( -170/32, 176/32),
			new cc.v2( -99/32, 118/32),
			new cc.v2( -27/32,97/32),
			new cc.v2( -27/32,47/32)
		],
		right:[
			new cc.v2( 147/32,346/32),
			new cc.v2( 187/32,270/32),
			new cc.v2( 170/32, 187.6/32),
			new cc.v2( 113/32, 121/32),
			new cc.v2( 30/32, 98/32),
			new cc.v2( 29/32, 43/32)
		],
		fallLine:[
			new cc.v2( -26/32, 10/32),
			new cc.v2( 29/32, 10/32),
		],
		bottom:[
			new cc.v2( -26/32,0/32),
			new cc.v2( 29/32,0/32)
		],
		floor:[
			new cc.v2( -320/32,-27/32),
			new cc.v2( -89/32,0/32),
			new cc.v2( 93/32,0/32),
			new cc.v2( 320/32,-27/32)
		],
		inner:[
			new cc.v2( -219/32,271/32),
			new cc.v2( 219/32,271/32),
			new cc.v2( 219/32,-271/32),
			new cc.v2( -219/32,-271/32)
		],
		outer:[
			new cc.v2( -319/32,391/32),
			new cc.v2( 319/32,391/32),
			new cc.v2( 319/32,-391/32),
			new cc.v2( -319/32,-391/32)
		],
		cup:[
			new cc.v2( -43/32,40/32),
			new cc.v2( -33/32,-42/32),
			new cc.v2( -21/32,-48/32),
			new cc.v2( 0/32,-50/32),
			new cc.v2( 21/32,-48/32),
			new cc.v2( 33/32,-42/32),
			new cc.v2( 43/32,40/32)
		],
		cupFallLine:[
			new cc.v2( -40/32,38/32),
			new cc.v2( 40/32,38/32)
		]
	},
	BallConfig:{
		BallColor:['Yellow','Green','Blue','Violet','Red'],
		BallColorDic:{
			Yellow:[255,254,108],
			Green:[65,255,152],
			Blue:[35,164,255],
			Violet:[208,61,234],
			Red:[245,27,68]
		},
		BallRow:[10,8,6,4,2],
		BallUpLevel:1,
		Radius:0.34,
		BallTotalNum:100,
		BallLinearDamping:0.8,
		BallAngularDamping:0.1,
		BallGravityScale:3,
		BallPreFall:30
	},
	ScoreLevel:[1,2,3,4,6],
	cdnCopyKeys:[],
	//道具概率参数                                                                                                                
	GamePropParam:{
		bagNum:{
			PropBig:0,
			PropUpLevel:0,
			PropAddBall:0
		},
		useNum:{
			PropBig:0,
			PropUpLevel:0,
			PropAddBall:0
		}
	},
	cdnGameConfig:{
		refreshBanner:0,		//0 关闭	1打开
		minShareTime:2,
		gameModel:'crazy',
		shareSuccessWeight:[1,1,0.8,0.8,0.6],
		PropRelive:20,//剩余20个小球是
		PropSBAFlag:4,
		PropAddNum:10,
		shareCustomSet:1		//0 关闭 自定义分享 1打开自定义分享
	},
	cdnOtherGameDoor:{
		locker:[
			{
				hideRate:0.5,
				hotFlag:1,
				name:"2048六角正版",
				appid:"wxc796e8cabc773566",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_sixAngle.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"绝地求升",
				appid:"wx2bc7cdb0119bb86b",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_snow.png",
				spriteFrameSpeed:1,
				linkSpriteFrames: [
					"https://alicdn.zhituokeji.com/minigame/spriteFrames/airCar/01.png",
					"https://alicdn.zhituokeji.com/minigame/spriteFrames/airCar/02.png",
					"https://alicdn.zhituokeji.com/minigame/spriteFrames/airCar/03.png",
					"https://alicdn.zhituokeji.com/minigame/spriteFrames/airCar/04.png"
				]
			},
			{
				hideRate:0.5,
				hotFlag:1,
				name:"无尽钓鱼",
				appid:"wx52f8dec006405bf6",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_fishmaster.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"俄罗斯2048",
				appid:"wx6838d3562692630c",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_2048clear.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"六角数字三消 ",
				appid:"wx9f92ce5369e9ea6c",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_threeClear.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"创意拼图",
				appid:"wxf7d561f6e80365e7",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_jigsaw.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"绝地求升",
				appid:"wx2bc7cdb0119bb86b",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_snow.png"
			},
			{
				hideRate:0.5,
				hotFlag:0,
				name:"无尽钓鱼",
				appid:"wx52f8dec006405bf6",
				logo:"https://alicdn.zhituokeji.com/minigame/scrollLinkGameImage/icon_fishmaster.png"
			}
		],
		InnerChain:{
			hotFlag:0,
			name:"2048六角正版",
			appid:"wxc796e8cabc773566",
			logo:"https://alicdn.zhituokeji.com/minigame/2048Config/linkImages/linkSixAngle.png"
		}
	},
	cdnPropParam:{	//道具自定义参数
		PropUnLock:{	//道具解锁盘数
			PropBig:1,
			PropUpLevel:1,
			PropAddBall:1,
			PropAD:1,
			PropShare:1,
			PropAV:1,
			PropInner:1,
			PropLocker:1,
			PropSBA:1
		},
		SBAOpenRate:{
			PropBig:0,
			PropUpLevel:0,
			PropAddBall:1
		},
		PropParam:{
			//变大概率参数设置
			PropBig:{
				default:{
					bagNum:1,
					useNum:1
				}
			},
			//升级概率参数设置
			PropUpLevel:{
				default:{
					bagNum:3,
					useNum:3
				}
			},
			//加5球概率参数设置
			PropAddBall:{
				default:{
					bagNum:-1,
					useNum:-1
				}
			}
		},
		PropShareOrADRate:{
			crazy:{
				default:{
					PropBig:{
						PropShare:1,
						PropAV:0
					},
					PropUpLevel:{
						PropShare:1,
						PropAV:0
					},
					PropRelive:{
						PropShare:1,
						PropAV:0
					},
					PropAddBall:{
						PropShare:1,
						PropAV:0
					},
					PropSAB:{
						PropShare:1,
						PropAV:0
					}
				}
			}
		}
	},
	cdnShareImages:["res/raw-assets/d7/d79c420a-58c2-4663-87c0-3119e3f3fd94.png"],
	cdnTexts:["你介意男生玩这个游戏吗?"]
};