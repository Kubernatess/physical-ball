
class Main extends egret.DisplayObjectContainer {

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;

        let sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);      
        sky.width = stageW;
        sky.height = stageH;

        this.CreateWorld();
        this.CreatePlane();
        this.addEventListener(egret.Event.ENTER_FRAME,this.update,this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN,this.onButtonClick,this);
    }

    // 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    //创建Word世界
    private world:p2.World;
    private CreateWorld(){
        this.world = new p2.World();
        //设置world为睡眠状态
        this.world.sleepMode = p2.World.BODY_SLEEPING;
        this.world.gravity = [0,1];
    }

    //生成地板Plane
    private planeBody:p2.Body;
    private CreatePlane(){
        //创建一个shape形状
        let planeShape:p2.Plane = new p2.Plane();
        //创建body刚体
        this.planeBody= new p2.Body({
            //刚体类型
            type:p2.Body.STATIC,
            //刚体的位置
            position:[0,this.stage.stageHeight]
        });
        this.planeBody.angle = Math.PI;
        this.planeBody.displays = [];
        this.planeBody.addShape(planeShape);
        this.world.addBody(this.planeBody);
    }


    private onButtonClick(e:egret.TouchEvent) {
        //贴图显示对象
        let display:egret.DisplayObject;
        let shpeBody:p2.Body;
        if(Math.random() >0.5){
            //添加方形刚体 
            var boxShape:p2.Shape = new p2.Box({width:140 ,height:80});
            shpeBody = new p2.Body({ mass: 1, position: [e.stageX, e.stageY], angularVelocity: 1});
            shpeBody.addShape(boxShape);
            this.world.addBody(shpeBody);
            display = this.createBitmapByName("rect_png");
            display.width = (<p2.Box>boxShape).width 
            display.height = (<p2.Box>boxShape).height                
        }
        else{
            //添加圆形刚体
            var circleShape:p2.Shape = new p2.Circle({radius:60});
            shpeBody = new p2.Body({ mass: 1, position: [e.stageX, e.stageY]});
            shpeBody.addShape(circleShape);
            this.world.addBody(shpeBody);
            display = this.createBitmapByName("circle_png");
            display.width = (<p2.Circle>circleShape).radius * 2 
            display.height = (<p2.Circle>circleShape).radius * 2
        }
        display.anchorOffsetX = display.width / 2
        display.anchorOffsetY = display.height / 2;
        display.x = -100;
        display.y = -100;
        shpeBody.displays = [display];
        this.addChild(display);
    }

    //帧事件，步函数
    private update() {
        this.world.step(2.5);
        var l = this.world.bodies.length;
        for (var i:number = 0; i < l; i++) {
            var boxBody:p2.Body = this.world.bodies[i];
            var box:egret.DisplayObject = boxBody.displays[0];
            if (box) {
                //将刚体的坐标和角度赋值给显示对象
                box.x = boxBody.position[0];
                box.y = boxBody.position[1];
                box.rotation = boxBody.angle * 180 / Math.PI;
                //如果刚体当前状态为睡眠状态，将图片alpha设为0.5，否则为1
                if (boxBody.sleepState == p2.Body.SLEEPING) {
                    box.alpha = 0.5;
                }
                else {
                    box.alpha = 1;
                }
            }
        }
    }
}