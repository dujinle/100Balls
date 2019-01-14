GlobalData = {
	AudioManager:{
		ButtonClick:0,
		//Ball中的音乐
		BallTouchCup:1,
		BallTouchFloor:2,
		//Cup中的音乐
		CupTouchFloor:3,
		GameFinish:4,
		AudioEnginMore:8,
		AudioPlays:[]
	},
	//数字更新时间
	TimeActionParam:{
		GuideMoveTime:2,			//引导动画时间
		EatNodeMoveTime:0.2,		//被吃掉的子移动时间
		EatNodeSameDelayTime:0,		//同类子移动延迟单元
		EatNodeOtherDelayTime:0.05,	//不同类子被吃间隔时间
		EatNodeBigTime:0.1,			//数字变大的时间这个值需要x2
		RefreshNodeTime:0.3,		//刷新数字的时间
		PropSBAScaleTime:0.3,		//宝箱弹出效果时间
		NumRollCell:2,				//数字roll的单元
		NumRollTime:0.2,			//数字刷新时长
		EatFlyTimeCell:0.5,			//数字飞的时间总时长 EatFlyTimeCell * 2.5
		StartGameMoveTime:0.3,		//开始界面的效果
		PauseGameMoveTime:0.3		//暂停游戏界面的时间
	},
	RigidBodyTag:{
		ball:0,
		contentClose:1,
		contentOpen:2,
		floor:3,
		contentLine:4,
		cupInner:5,
		cupLine:6,
		cupSide:7
	},
	GameRunTime:{
		ContentBallsDic:{},
		BallNodesPool:{},
		BallNodesDic:{},
		CupNodesDic:{},
		AudioPlayNum:0,
		BallUnFallNum:0,
		CupAbledNum:0,
		BallAbledNum:0,
		TotalScore:0,
		CircleLevel:0
	},
	GameInfoConfig:{
		audioSupport:1,
		ballTouchBottom:0,
		maxScore:0,
		maxLevel:0,
		shareTimes:0,
		gameStatus:0,
		linerDamp:0,
		juNum:0
	},
	cdnGameConfig:{
		refreshBanner:0,		//0 关闭	1打开
		minShareTime:2,
		gameModel:'crazy',
		shareSuccessWeight:[1,1,0.8,0.8,0.6],
		shareCustomSet:1		//0 关闭 自定义分享 1打开自定义分享
	},
	CupConfig:{
		CupColor:['White','Green','Blue','Violet','Orange','Red'],
		CupColorDic:{
			White:[255,255,255],
			Green:[0,128,0],
			Blue:[0,0,255],
			Violet:[128,0,128],
			Orange:[255,165,0],
			Red:[255,0,0]
		},
		CupCreatNum:7,
		CupMoveSpeed:100,
		CupMoveASpeed:1000,
		CupMoveDir:'right',
		CupUpLevel:3
	},
	BallConfig:{
		BallColor:['Yellow','Green','Blue','Violet','Orange','Red'],
		BallColorDic:{
			Yellow:[255,255,0],
			Green:[0,128,0],
			Blue:[0,0,255],
			Violet:[128,0,128],
			Orange:[255,165,0],
			Red:[255,0,0]
		},
		BallGravityScale:5,
		BallUpLevel:1,
		BallTotalNum:100,
		BallGravityScale:10,
		BallPreFall:20,
		BallRowArray:[8,9,10,11,12,12,11,10,9,8]
	},
	ScoreLevel:[1,2,3,4,5,6],
	cdnShareImages:["res/raw-assets/resources/shareImages/shareDefault.d3b6b.png"],
	cdnTexts:["你介意男生玩这个游戏吗?"]
};