define(['common'], function (common) {
	// 設定値いろいろ
	common.nativeDownload = false;
	common.background = "web_common.ExportJson"; // 背景を変えるたびに格納される
	common.bgm = "bgm01_anime07";         // BGMを開始するたびに格納される

	common.settingBg = 'web_0011.ExportJson';
	common.settingBgm = "bgm01_anime07";

	common.mainQuestMode = "NORMAL";

	common.settingThemeInit = function () {
		if (common.storage.gameUser) {
			// console.log(common.storage.gameUser);
			var bgId = common.storage.gameUser.get("bgItemId");
			var bgItem = common.storage.gameUser.get("bgItem");
			if (bgId && bgItem) {
				common.settingBg = bgItem.backgroundImage;
				if (bgItem.parameter) {
					common.settingBgm = bgItem.parameter;
				} else {
					common.settingBgm = "bgm01_anime07";
				}
			} else {
				common.settingBg = 'web_0011.ExportJson';
				common.settingBgm = "bgm01_anime07";
			}
		} else {
			common.settingBg = 'web_0011.ExportJson';
			common.settingBgm = "bgm01_anime07";
		}
	};

	// 強制リソースダウンロードフラグ
	common.resourceUpdated = false;

	common.tutorialId = null;
	common.tutorialUtil = null;

	common.historyArr = [];
	common.doc = document;
	common.content = $("#mainContent");
	common.location = "";
	common.imgData = {};
	var htmlHeightFlg = false;

	// ------------------------------------------------------------------------.
	// ローディングあれこれ
	// loading: ajax通信時に表示　ready: ページ遷移時に表示
	// ------------------------------------------------------------------------.
	common.loading = {};
	common.loading.target = $("#loading");

	common.loading.hide = function () {
		setTimeout(function () { common.androidKeyForceStop = false }, 500);// 連打防止でディレイをかける
		common.loading.target.style.display = "none";
	};
	common.loading.show = function () {
		common.androidKeyForceStop = true;
		common.loading.target.style.display = "block";
	};

	common.ready = {};
	common.ready.target = $('#ready');
	common.ready.content = $('#baseContainer');

	common.ready.hide = function () { // 内容を表示する
		// ネイティブへの遷移時に暗転していたら暗転を解除する
		if ($(common.ready.target).hasClass("show") ||
			$(common.ready.target).hasClass("fadein") ||
			$(common.ready.target).hasClass("preNativeFadeIn")) {
			setTimeout(function () {
				common.ready.target.className = "fadeout";
				common.androidKeyForceStop = false;
			}, 100);
		}

		if ($(common.ready.target).hasClass("tutorialStart")) {
			setTimeout(function () {
				common.ready.target.className = "tutorialStartFadeout";
				common.androidKeyForceStop = false;
			}, 100);
		}

		if ($(common.ready.target).hasClass("gameStartFadeIn")) {
			setTimeout(function () {
				common.ready.target.className = "gameStartFadeOut";
				common.androidKeyForceStop = false;
			}, 100);
		}

		// ページの内容を表示する
		if ($(common.ready.content).hasClass("fadeout")) {
			setTimeout(function () {
				common.removeClass(common.ready.content, "fadeout");
				common.addClass(common.ready.content, "fadein");
				common.androidKeyForceStop = false;
			}, 300);
		}
	};
	common.ready.show = function () { // 内容を隠す
		if (!htmlHeightFlg) { // 画面の高さを取得する
			if (common.doc.getElementsByTagName("html")[0].style.height === "" && window.innerHeight !== 0) {
				common.doc.getElementsByTagName("html")[0].style.height = window.innerHeight + "px";
				htmlHeightFlg = true;
			}

			/* ios11対策 */
			if (common.ua.ios) {
				common.addClass(common.doc.getElementsByTagName("body")[0], "ios");
			} else {
				common.addClass(common.doc.getElementsByTagName("body")[0], "android");
			}
		}
		// ページの内容を隠す
		common.androidKeyForceStop = true;

		common.removeClass(common.ready.content, "fadein");
		common.addClass(common.ready.content, "fadeout");
		common.tapBlock(true);
	};
	// ------------------------------------------------------------------------.
	// ネイティブから画像を取得
	common.getNativeObj = function () {
		var nativeSendObj = {};

		var imgArr = $('[data-nativeimgkey]') || [];
		var bgArr = $('[data-nativebgkey]') || [];

		_.each(imgArr, function (elm) {
			var key = elm.dataset.nativeimgkey;
			if (!common.imgData[key] && key !== "") {
				nativeSendObj[key] = elm.dataset.src;
			}
		});

		_.each(bgArr, function (elm) {
			var key = elm.dataset.nativebgkey;
			if (!common.imgData[key] && key !== "") {
				nativeSendObj[key] = elm.dataset.src;
			}
		});

		return nativeSendObj;
	};
});