(function(content){

	//用法new Screenshot(parent)	传入为字符串，id前面加#，class前面加.
	
	function Screenshot (parent) {
		this.box = document.querySelector(parent);
		this.img = this.box.querySelector('img') || null;
		this.c = canvas(this.box);
		this.bg = blackbg(this.box);
		this.c2 = canvas(this.bg);
		this.c3 = canvas( this.box, true );
		this.init();
	}

	content.Screenshot = Screenshot;

	Screenshot.prototype.init = function() {
		if ( !this.img ) return;

		var x0, y0, x1, y1;
		var isDown = false, isImage = false, isDrag = false;

		var width, height;

		var img = new Image();
		//img.crossOrigin = "Anonymous";
		img.src = this.img.src;
		img.onload = () => {
			width = img.width; 
			height = img.height;	
			this.c.width = width;
			this.c.height = height;
			this.box.style.width = width + 'px';
			this.box.style.height = height + 'px';
			this.bg.style.width = width + 'px';
			this.bg.style.height = height + 'px';
			isImage = true;
		}

		var ctx = this.c.getContext('2d');
		var ctx2 = this.c2.getContext('2d');
		var ctx3 = this.c3.getContext('2d');

		//绘制截图框
		this.c.addEventListener( 'mousedown', (e) => {
			if ( !isImage ) return;
			e = e || window.event;
			isDown = true;
			x0 = e.pageX;
			y0 = e.pageY;
		});

		this.c.addEventListener( 'mousemove',  (e) => {
			e = e || window.event;
			if ( !isDown ) return;
			ctx.clearRect( 0, 0, width, height );
			x1 = e.pageX;
			y1 = e.pageY;
			drawLine( ctx, x0, y0, x1, y0 );  //上
			drawLine( ctx, x1, y1, x1, y0 );  //右
			drawLine( ctx, x1, y1, x0, y1 );  //下
	        drawLine( ctx, x0, y0, x0, y1 );  //左
		});

		this.c.addEventListener( 'mouseup', (e) => {
			e = e || window.event;
			if ( !isDown ) return;
			isDown = false;
			this.bg.style.display = 'block';
			ctx.clearRect( 0, 0, width, height );
			if ( x0 > x1 ) {
                temp = x0;
                x0 = x1;
                x1 = temp;
            }
            if ( y0 > y1 ) {
                temp = y0;
                y0 = y1;
                y1 = temp;
			}
			drawImg( this.c2, ctx2, this.img, x0, y0, x1, y1 );
			drawImg( this.c3, ctx3, this.img, x0, y0, x1, y1, true );
			// try {
				// let dataUrl = this.c2.toDataURL("image/jpg"); 
			// } catch (err) {
			// 	console.log(1)
			// }
			
		});

		//拖动截图框
		var offsetX0, offsetX0, mL, mT, cWidth, cHeight;
		this.c2.addEventListener( 'mousedown', (e) => {
			e.stopPropagation();
			offsetX0 = e.clientX - this.box.offsetLeft;  
			offsetY0 = e.clientY - this.box.offsetTop;
			mL = parseInt( getStyle( this.c2, 'marginLeft' ) );
			mT = parseInt( getStyle( this.c2, 'marginTop' ) );
			cWidth = parseInt( getStyle( this.c2, 'width' ) );
			cHeight = parseInt( getStyle( this.c2, 'height' ) );
			isDrag = true;
		})

		document.body.addEventListener( 'mousemove', (e) => { //防止拖动太快移出C2范围出错，使用body监听事件
			if ( !isDrag ) return;

			let offsetX = e.clientX - this.box.offsetLeft,
				offsetY = e.clientY - this.box.offsetTop;

			let moveX,moveY;   //移动距离

			//判断是否越界
			if ( offsetY < 3 ) {
				offsetY = 3;
			} else if ( offsetY > height-3 ) {
				offsetY = height-3;
			}
			if ( offsetX < 3 ) {
				offsetX = 3;
			} else if ( offsetX > width-3 ) {
				offsetX = width-3;
			}

			moveX = offsetX - offsetX0,
			moveY = offsetY - offsetY0;
			
			//判断是否是4个角,

			if ( offsetX0 - mL < 15 && offsetY0 - mT < 15 ) {        //左上角
				let msL = mL + moveX,   //重新计算左上的外边距
					msT = mT + moveY;
				let xWidth = cWidth - moveX, //重新计算c2的大小
					xHeight = cHeight - moveY;
				this.c2.width = xWidth;
				this.c2.height = xHeight;
				this.c2.style.marginTop = msT + 'px';
				this.c2.style.marginLeft = msL + 'px';
				ctx2.drawImage( img, msL, msT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				this.c3.width = xWidth;
				this.c3.height = xHeight;
				ctx3.drawImage( img, msL, msT, xWidth, xHeight, 0, 0, xWidth, xHeight);
			}
			else if ( offsetX0 - mL < 15 && offsetY0 - mT > cHeight - 15 ) { //左下
				let msL = mL + moveX;
				let xWidth = cWidth - moveX,
					xHeight = cHeight + moveY;
				this.c2.width = xWidth;
				this.c2.height = xHeight;
				this.c2.style.marginLeft = msL + 'px';
				ctx2.drawImage( img, msL, mT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				this.c3.width = xWidth;
				this.c3.height = xHeight;
				ctx3.drawImage( img, msL, mT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				return;
			}
			else if ( offsetX0 - mL > cWidth - 15 && offsetY0 - mT > cHeight - 15 ) {//右下
				let xWidth = cWidth + moveX,
					xHeight = cHeight + moveY;
				this.c2.width = xWidth;
				this.c2.height = xHeight;
				ctx2.drawImage( img, mL, mT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				this.c3.width = xWidth;
				this.c3.height = xHeight;
				ctx3.drawImage( img, mL, mT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				return;
			}
			else if ( offsetX0 - mL > cWidth - 15 && offsetY0 - mT < 15 ) { //右上
				let msT = mT + moveY;
				let xWidth = cWidth + moveX,
					xHeight = cHeight - moveY;
				this.c2.width = xWidth;
				this.c2.height = xHeight;
				this.c2.style.marginTop = msT + 'px';
				ctx2.drawImage( img, mL, msT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				this.c3.width = xWidth;
				this.c3.height = xHeight;
				ctx3.drawImage( img, mL, msT, xWidth, xHeight, 0, 0, xWidth, xHeight);
				return;
			}
			else{
				let xoffset = moveX + mL,     //拖动时更改c2的外边距以达到拖动的效果
					yoffset = moveY + mT;
				//判断拖动是否越界
				if ( xoffset < 0 ) {
					xoffset = 0;
				} else if ( xoffset > width - cWidth ){
					xoffset = width - cWidth
				}		
				if ( yoffset < 0 ) {
					yoffset = 0;
				} else if ( yoffset > height - cHeight ){
					yoffset = height - cHeight
				}
				ctx2.drawImage( img, xoffset, yoffset, cWidth, cHeight, 0, 0, cWidth, cHeight);
				this.c2.style.marginTop = yoffset + 'px';
				this.c2.style.marginLeft = xoffset + 'px';
				ctx3.drawImage( img, xoffset, yoffset, cWidth, cHeight, 0, 0, cWidth, cHeight);	
			}
			
			

		})

		document.body.addEventListener( 'mouseup', function (e) {
			isDrag = false;
		})
		

		this.bg.addEventListener( 'mousedown', function (e) {
			ctx.clearRect( 0, 0, width, height );
			ctx2.clearRect( 0, 0, width, height );
			ctx3.clearRect( 0, 0, width, height );
			this.style.display = "none";
		})
	};

	function drawImg ( canv, ctx, img, x0, y0, x1, y1, isTl ) {
		canv.width = x1 - x0;
		canv.height = y1 - y0;
		if ( !isTl ) {
			canv.style.marginTop = y0 + 'px';
			canv.style.marginLeft = x0 + 'px';
		}
		ctx.drawImage( img, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0 );
	}

	function drawLine( ctx, x0, y0, x1, y1 ) {
		ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = 'white';
        ctx.stroke();
	}

	function canvas ( parent, istwo ) {
		var c = document.createElement('canvas');
		if ( !istwo ) {
			c.style.position = 'absolute';
			c.style.top = '0';
			c.style.left = '0';
			c.style.zIndex = '1';
			c.style.cursor = 'crosshair';
		}
		parent.appendChild(c);	
		return c;	
	}

	// function button ( parent ) {
	// 	let button = document.createElement('button');
	// }

	function blackbg (parent) {
		var black = document.createElement('div');
		black.style.position = 'absolute';
		black.style.top = '0';
		black.style.left = '0';
		black.style.zIndex = '10';
		black.style.background = 'rgba(0,0,0,0.8)';
		black.style.display = 'none';
		parent.appendChild(black);
		return black;
	}

	function getStyle(oDiv,name){
        if (oDiv.currentStyle) {
            return oDiv.currentStyle[name];
        } else {
            return getComputedStyle(oDiv, false)[name];
        }
    }
}(this))