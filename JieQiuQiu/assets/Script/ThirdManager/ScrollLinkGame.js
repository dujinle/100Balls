var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
        //内链预设
        linkPrefab: {
            default: null,
            type: cc.Prefab,
        },
        //滑动视图
        scrollView: {
            default: null,
            type: cc.Node,
        },
        //所有的内链节点
        contentNode: {
            default: null,
            type: cc.Node,
        },

        //内链信息
        linkGameConfig: null, //内链配置信息

        //最左边位置
        leftPosX: 0,
        //最右边位置
        rightPosX: 0,
        //显示的屏幕宽度
        showFrameWidth: 0,
        //间隔大小
        space: 17, //间隔大小
        linkBoardWidth: 108, //内链底板宽度
        //视图滑动
        scrollViewComponent: null,
        hasScroll: false, //是否有滑动
        countdownID: 0, //延迟
    },

    //创建所有的内链入口
    createAllLinkGame: function (linkGameConfig) {
		console.log('createAllLinkGame');
        if (!linkGameConfig) return;
        if (!this.contentNode) return;
        this.contentNode.stopAllActions();
        this.contentNode.x = 0;
        this.contentNode.removeAllChildren();
        this.showFrameWidth = this.scrollView.width;
        this.linkGameConfig = linkGameConfig;
        var linkGameNum = this.linkGameConfig.length;
        this.contentNode.width = linkGameNum * this.linkBoardWidth + (linkGameNum - 1) * this.space;
		var array = util.getRandomArray(linkGameNum);
        for (let index = 0; index < linkGameNum; index++) {
            var linkItem = this.linkGameConfig[array[index]];
            if (linkItem) {
                //设置内链的坐标
				console.log(linkItem);
                var linkInstance = cc.instantiate(this.linkPrefab);
                var linkItemScript = linkInstance.getComponent('LockerItem');
                if (linkItemScript) {
                    linkItemScript.setLinkGame(linkItem);
                }
                this.contentNode.addChild(linkInstance);
            }
        }
        this.scrollViewComponent = this.scrollView.getComponent(cc.ScrollView);
        this.leftPosX = -(this.contentNode.width - this.showFrameWidth);
        this.rightPosX = 0;

        setTimeout(() => {
            this.playScrollLinkGame(true);
        }, 1000);
    },

    //循环滑动播放内链
    playScrollLinkGame: function (isInit) {
		var self = this;
		if (!this.contentNode) return;
        this.contentNode.stopAllActions();
        console.log('停留位置', this.contentNode.x);
        if (this.contentNode.width <= this.showFrameWidth) {
            console.log('内链宽度小于显示宽度');
            return;
        }
        clearTimeout(this.countdownID);
        var time = isInit ? 10 : 3000;
        this.countdownID = setTimeout(() => {
            //先判断位置,偏向左边还是右边
            var distForLeft = Math.abs(self.contentNode.x - self.leftPosX);
            var distForRight = Math.abs(self.contentNode.x - self.rightPosX);
            var diffValue = distForLeft - distForRight;
            if (diffValue > 0) {
                self.playLeftAction(diffValue);
            } else {
                self.playRightAction();
            }
        }, time);
    },

    //向左边运动
    playLeftAction: function (diffValue) {
        if (!this.node.active) return;
        this.contentNode.stopAllActions();
        var playTime = Math.ceil(diffValue / (this.linkBoardWidth + this.space)) * 2000 / 1000;
        var moveTime = cc.moveTo(Math.abs(playTime), cc.v2(this.leftPosX, 0));
        var callBack = cc.callFunc(this.playRightAction, this);
        this.contentNode.runAction(cc.sequence(moveTime, cc.delayTime(2), callBack));
    },

    //向右边运动
    playRightAction: function () {
        if (!this.node.active) return;
        this.contentNode.stopAllActions();
        var playTime = Math.ceil(Math.abs(this.contentNode.x) / (this.linkBoardWidth + this.space)) * 2000 / 1000;
        var moveTime = cc.moveTo(Math.abs(playTime), cc.v2(0, 0));
        var self = this;
        var callBack = cc.callFunc(function () {
            var distForLeft = Math.abs(self.contentNode.x - self.leftPosX);
            var distForRight = Math.abs(self.contentNode.x - self.rightPosX);
            var diffValue = distForLeft - distForRight;
            self.playLeftAction(diffValue);
        });
        this.contentNode.runAction(cc.sequence(moveTime, cc.delayTime(2), callBack));
    },

    update: function () {
        if (this.scrollViewComponent && this.scrollViewComponent.isScrolling() && !this.hasScroll) {
            this.playScrollLinkGame(false);
        } else {
            this.hasScroll = false;
        }
    }
});