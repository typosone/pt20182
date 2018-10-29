// グローバルに展開
phina.globalize();

// 定数
const BLOCK_WIDTH = 40 * 2;
const BLOCK_HEIGHT = 60 / 2;
const PADDLE_WIDTH = BLOCK_WIDTH * 1.5;
const PADDLE_HEIGHT = BLOCK_HEIGHT / 2;
const BALL_RADIUS = BLOCK_WIDTH / 8;

// メインシーン
phina.define('MainScene', {
    superClass: 'DisplayScene',
    // コンストラクタ
    init: function () {
        this.superInit();
        this.backgroundColor = 'black';

        this.blockGroup = DisplayElement().addChildTo(this);
        const scene = this;
        // Gridを利用してブロック設置
        Array.range(2, 16, 2).each(spanX => {
            Array.range(1, 4, 0.5).each(spanY => {
                Block().addChildTo(scene.blockGroup)
                    .setPosition(scene.gridX.span(spanX), scene.gridY.span(spanY));
            });
        });


        // パドル移動ライン
        const paddleY = this.gridY.span(14.5);
        // パドル設置
        const paddle = Paddle().addChildTo(this)
            .setPosition(this.gridX.center(), paddleY);
        this.paddle = paddle;

        // 位置判定用のRect
        const screenRect = Rect(0, 0, 640, 960);
        this.screenRect = screenRect;

        // 画面上でのタッチ移動時
        this.onpointmove = function (e) {
            // タッチ位置に移動
            paddle.setPosition(e.pointer.x | 0, paddleY);
            // 画面はみ出し防止
            if (paddle.left < screenRect.left) {
                paddle.left = screenRect.left;
            }
            if (paddle.right > screenRect.right) {
                paddle.right = screenRect.right;
            }
        };

        // ボール生成
        this.ball = Ball().addChildTo(this);

        // ゲームステータス
        this.status = 'ready';

        this.onpointend = function () {
            if (scene.status === 'ready') {
                // ボール発射
                scene.ball.vy = -scene.ball.speed;
                scene.status = 'move';
            }
        };
    },
    update: function () {
        const ball = this.ball;
        const paddle = this.paddle;
        const screenRect = this.screenRect;

        // ステータスがreadyのときはボールはパドルの上
        if (this.status === 'ready') {
            ball.x = paddle.x;
            ball.vx = ball.vy = 0;
            ball.bottom = paddle.top;
        }
        // ステータスがmoveのときはボールは自由に動く
        if (this.status === 'move') {
            // ボール移動
            ball.moveBy(ball.vx, ball.vy);
            // 画面端反射
            // 上
            if (ball.top < screenRect.top) {
                ball.top = screenRect.top;
                ball.vy = -ball.vy;
            }
            // 左
            if (ball.left < screenRect.left) {
                ball.left = screenRect.left;
                ball.vx = -ball.vx;
            }
            // 右
            if (ball.right > screenRect.right) {
                ball.right = screenRect.right;
                ball.vx = -ball.vx;
            }
            // 落下
            if (ball.top > screenRect.bottom) {
                // 準備状態へ
                this.status = 'ready';
            }
            // パドルとの反射
            if (ball.hitTestElement(paddle) && ball.vy > 0) {
                ball.bottom = paddle.top;
                ball.vy = -ball.vy;
                // 当たった位置で角度を変化させる
                const dx = paddle.x - ball.x;
                ball.vx = -dx / 5;
            }
        }

        this.blockGroup.children.some(block => {
            // ボールとブロックが衝突してなかったらおしまい
            if (!ball.hitTestElement(block)) {
                return false;
            }

            // ブロックを削除
            block.remove();

            // ブロックのどこに当たったか詳しく調べる

            // 左上角
            if (ball.top < block.top && ball.left < block.left) {
                //位置補正
                ball.right = block.left;
                ball.bottom = block.top;
                //移動方向設定
                ball.vx = -ball.speed;
                ball.vy = -ball.speed;
                return true;
            }

            // 右上角
            if (ball.top < block.top && ball.right > block.right) {
                //位置補正
                ball.left = block.right;
                ball.bottom = block.top;
                //移動方向設定
                ball.vx = ball.speed;
                ball.vy = -ball.speed;
                return true;
            }

            // 左下角
            if (ball.bottom > block.bottom && ball.left < block.left) {
                //位置補正
                ball.right = block.left;
                ball.top = block.bottom;
                //移動方向設定
                ball.vx = -ball.speed;
                ball.vy = ball.speed;
                return true;
            }

            // 右下角
            if (ball.bottom > block.bottom && ball.right > block.right) {
                //位置補正
                ball.left = block.right;
                ball.top = block.bottom;
                //移動方向設定
                ball.vx = ball.speed;
                ball.vy = ball.speed;
                return true;
            }

            // 左側
            if (ball.left < block.left) {
                //位置補正
                ball.right = block.left;
                //移動方向設定
                ball.vx = -ball.vx;
                return true;
            }

            // 右側
            if (ball.right > block.right) {
                //位置補正
                ball.left = block.right;
                //移動方向設定
                ball.vx = -ball.vx;
                return true;
            }

            // 上側
            if (ball.top < block.top) {
                //位置補正
                ball.bottom = block.top;
                //移動方向設定
                ball.vy = -ball.vy;
                return true;
            }

            // 下側
            ball.top = block.bottom;
            ball.vy = -ball.vy;

            return true;
        });
    },
});

// ブロッククラス
phina.define('Block', {
    superClass: 'RectangleShape',
    // コンストラクタ
    init: function () {
        this.superInit({
            width: BLOCK_WIDTH,
            height: BLOCK_HEIGHT,
        });
    },
});

// パドルクラス
phina.define('Paddle', {
    superClass: 'RectangleShape',
    init: function () {
        this.superInit({
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            fill: 'silver',
        });
    },
});

// ボールクラス
phina.define('Ball', {
    superClass: 'CircleShape',
    init: function () {
        this.superInit({
            radius: BALL_RADIUS,
            fill: 'red',
            stroke: 'red',
        });
        this.speed = 6;
    },
});

phina.main(() => {
    const app = GameApp({
        title: "Break Out",
        fps: 60,
    });

    app.run();
});