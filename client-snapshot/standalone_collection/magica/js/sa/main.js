var nativeJsonObj;
var nativeCallback;
var saveDataCallback;
var getBaseData;
var localDataCallback;
var fontDataGet;
var androidBackKey;
var questRetire;
var configCallback;
var suspendAwake;

require([
	'common',
	'commonEvent',
	'commonExt',
	'command',
	'chara',
	'card',
	'skill',
	'pieceskill',
	'magia',
], function (
	common,
	commonEvent,
	commonExt,
	cmd,
	chara,
	card,
	skill,
	pieceskill,
	magia
) {
	// グローバル変数
	var charaCards = {};
	var resBase = 'resource/image_native/';

	cmd.getFontData();

	// ネイティブ連携系の注入
	nativeJsonObj = {};
	nativeCallback = function (res) {
		console.log("nativeCallback:function:", res);
		$('#commandDiv').trigger("nativeCallback", res);
	};
	saveDataCallback = function (res) {
		$('#commandDiv').trigger("saveDataCallback", res);
	};
	// base64データを返してもらう
	getBaseData = function (res) {
		$('#baseReceive').trigger("getBaseData", res);
	};
	// ローカル保存データを返してもらう
	localDataCallback = function (res) {
		$('#localDataDiv').trigger('localDataCallback', res);
	};

	fontDataGet = function (json) {
		var rule = [];
		// console.log("フォントコマンドが実行されました:");
		var styleSheet = document.styleSheets.item(1);
		rule.push("@font-face {font-family: 'motoya'; src: url('data:font/ttf;base64," + String(json.motoya) + "');}");
		rule.push("@font-face {font-family: 'mbm'; src: url('data:font/ttf;base64," + String(json.motoya) + "');}");

		_.each(rule, function (_rule, b, c) {
			var index = styleSheet.cssRules.length;
			styleSheet.insertRule(_rule, index);
		});

	};

	// アンドロイドの戻るボタンが押されたときに走らせてもらう
	androidBackKey = function (res) {
		$('#androidBackKey').trigger("androidBackKey", res);
	};

	// クエストリタイア時に走らせてもらう
	questRetire = function (res) {
		$('#questRetire').trigger("questRetire", res);
	};

	// ネイティブ設定系受取
	configCallback = function (res) {
		$('#configCallback').trigger("configCallback", res);
	};
	// サスペンド起動時に走らせてもらう
	suspendAwake = function (res) {
		$('#suspendAwake').trigger("suspendAwake", res);
	};

	// 所有チェック
	var isOwnedUCC = function (charaId, cardId) {
		return (common.userCharaCollection[charaId] && common.userCharaCollection[charaId].includes(cardId))
	}

	// ロード後処理
	$(function () {
		// ローカルデータ取得
		common.userCharaCollection = {};
		$('#localDataDiv').on('localDataCallback', function (e, res) {
			// JSONとして取り扱う
			try {
				common.userCharaCollection = JSON.parse(res).data;
			} catch (err) {
				console.log(err);
			}

			// リスト描画
			$('#charaWrapInner').hide();
			_.each(chara.data, renderListItem);
			cmd.getBaseData(common.getNativeObj());
			$('#charaWrapInner').show();

			// イベント登録
			$("#tabArea .tabBtns li").on(common.cgti(), tabFunc);

			$('#localDataDiv').off();
		});
		cmd.loadDataToLocal();
		// BGM再生
		cmd.startBgm('bgm01_anime07');
	});

	// リスト表示
	function renderListItem(c) {

		// 枠
		var item = $('#tmplCharaListItem').clone().removeAttr('id').removeAttr('style');
		item.addClass(c.attributeId);
		item.attr('chara-id', c.id);
		// キャラ名
		item.find('.nameWrap span.att').addClass(c.attributeId);
		item.find('.nameWrap p.name').text(c.name).append($('<span class="title">').text(c.title));
		item.find('.nameWrap p.kana').text(c.kana);

		// アイコン処理
		var cardList = card.data.filter(function (cd) { return cd.charaNo === c.id });
		charaCards[c.id] = cardList;
		_.each(cardList, appendListIcon, item);

		// イベント登録
		if (common.userCharaCollection[c.id] && common.userCharaCollection[c.id].length > 0) {
			item.on(common.cgti(), openDetail);
		}

		// 親要素にくっつける
		var itemParent = $('#charaWrapInner');
		itemParent.append(item);
	}

	function appendListIcon(c) {
		var icon = $('<div class="userCharaIcon">').addClass(c.attributeId).addClass(c.rank);
		if (isOwnedUCC(c.charaNo, c.cardId)) { // 所有チェック

			var rank = Number(c.rank.split('RANK_')[1]);
			if (rank > Number(this.attr('max-card-rank'))) {
				this.attr('max-card-id', c.cardId);
				this.attr('max-card-rank', rank);
			}

			var attKey = 'att_' + c.attributeId.toLowerCase();
			var starKey = 'star_' + c.rank.toLowerCase();
			var frameKey = 'frame_' + c.rank.toLowerCase();
			var cardKey = 'card_' + c.cardId + '_f';
			var bgKey = 'bg_' + c.attributeId.toLowerCase();

			var attSrc = resBase + 'card/frame/' + attKey + '.png';
			var starSrc = resBase + 'card/frame/' + starKey + '.png';
			var frameSrc = resBase + 'card/frame/' + frameKey + '.png';
			var cardSrc = resBase + 'card/image/' + cardKey + '.png';
			var bgSrc = resBase + 'card/frame/' + bgKey + '.png';

			icon.append($('<span class="att" data-nativebgkey="' + attKey + '" data-src="' + attSrc + '">'));
			icon.append($('<span class="star" data-nativebgkey="' + starKey + '" data-src="' + starSrc + '">'));
			icon.append($('<span class="rank" data-nativebgkey="' + frameKey + '" data-src="' + frameSrc + '">'));
			icon.append($('<img data-nativeimgkey="' + cardKey + '" data-src="' + cardSrc + '">'));
			icon.append($('<span class="bg" data-nativebgkey="' + bgKey + '" data-src="' + bgSrc + '">'));
		} else {
			icon.append($('<span class="closed">'));
		}
		this.find('.charaIconWrap').append(icon);
	}


	// detail表示
	function openDetail(e) {
		// キャラの入れ替え処理
		e.preventDefault();
		if (common.isScrolled()) return;
		//if(!this.model.charaOpenFlag) return;
		//if(common.detailView) common.detailView = null;

		var charaId = $(this).attr('chara-id');
		var selChara = chara.data.filter(function (d) { return d.id == charaId })[0];
		var cardId = $(this).attr('max-card-id');
		var selCard = card.data.filter(function (d) { return d.cardId == cardId })[0];

		//common.scrollSet("hiddenWrap", "scrollInner");
		renderDetail(selChara, selCard);
		cmd.getBaseData(common.getNativeObj());

		$('#mainContent').addClass('hide');
		$('#cardDetail').removeClass('hide');
	}

	// detail描画
	function renderDetail(selChara, selCard) {

		// 枠
		var detailParent = $('#cardDetail');
		var detail = $('#tmplCharaDetail').clone().removeAttr('id').removeAttr('style');
		detailParent.attr('chara-id', selChara.id); // 動画再生用にcharaId参照できるようにしておく。

		// キャラ名
		detail.find('#detailCardName span#att').addClass(selChara.attributeId.toLowerCase());
		detail.find('#detailCardName p.charaName').text(selChara.name);
		if (selChara.title) {
			detail.find('#detailCardName p.charaName').append($('<span class="title ts_pink">').text(selChara.title));
		}
		// キャラ画像
		var cardImageDiv = detail.find('#detailCardImage');
		var cardFrame = "frame_" + selChara.attributeId.toLowerCase() + '_' + selCard.rank.toLowerCase();
		cardImageDiv.append($('<div data-nativebgkey="' + cardFrame + '" data-src="' + resBase + 'card/frame/' + cardFrame + '.png" class="cardFrame ' + selCard.rank + ' ' + selChara.attributeId + '">'));
		cardImageDiv.append($('<img class="cardImg se_tabs" data-nativeimgkey="card_' + selCard.cardId + '_c" data-src="' + resBase + 'card/image/card_' + selCard.cardId + '_c.png" alt="">'));
		cardImageDiv.append($('<img class="zoomImg se_tabs" data-nativeimgkey="card_' + selCard.cardId + '_c" data-src="' + resBase + 'card/image/card_' + selCard.cardId + '_c.png" alt="">'));
		cardImageDiv.append($('<span class="moviePlayBtn se_tabs TE">'));

		// ちびキャラ情報
		var chibicharaDiv = detail.find("#cardDetailMiniChara");
		chibicharaDiv.find('img').attr('data-nativeimgkey', 'mini_' + selCard.miniCharaNo + '_s');
		chibicharaDiv.find('img').attr('data-src', resBase + 'mini/image/mini_' + selCard.miniCharaNo + '_s.png');
		chibicharaDiv.find('#rare').attr('class', selCard.rank);
		for (var i = 0; i < Number(selCard.rank.split('RANK_')[1]); i++) {
			chibicharaDiv.find('#rare').append($('<span>'));
		}

		// キャラステータス
		var maxStatus = getMaxStatus(selCard);
		var statusDiv = detail.find(".statusWrap");
		statusDiv.find("#detailLv .currentLv").text(getMaxLevel(selCard.rank));
		statusDiv.find("#detailLv .maxLv").text(getMaxLevel(selCard.rank));
		var typeText = {
			'BALANCE': '平衡',
			'ATTACK': '攻击',
			'DEFENSE': '防御',
			'MAGIA': 'Magia',
			'HEAL': '治疗',
			'SUPPORT': '协助',
			'ULTIMATE': '究极',
			'CIRCLE_MAGIA': '圆环Magia'
		};
		statusDiv.find(".type span.tdStyle").text(typeText[selCard.initialType]);

		var paramsDiv = detail.find("#popupCharaStatus")
		paramsDiv.find(".c_red").eq(0).text(maxStatus.hp);
		paramsDiv.find(".c_red").eq(1).text(maxStatus.attack);
		paramsDiv.find(".c_red").eq(2).text(maxStatus.defense);

		detail.find('.profileWrap .detail').text(selChara.description);
		detail.find('.exProfile1 .tdStyle').text(selChara.school);
		detail.find('.selCharacterDesign').text(selChara.designer);
		detail.find('.selIllustTitle').text('★' + selCard.rank.split('RANK_')[1] + ' 插图');
		detail.find('.selIllustrator').text(selCard.illustrator);
		detail.find('.selCharacterVoice').text(selChara.voiceActor);

		// スキル
		var selSkill = skill.data.filter(function (s) { return s.id == selCard.skillId })[0];
		var selMagia = magia.data.filter(function (s) { return s.id == selCard.magiaId })[0];
		for (var i = 1; i <= 5; i++) {
			detail.find('#charaSkill ul.commandList').append($('<li class="' + selCard['commandType' + i] + '">'));
		}
		// コネクト
		detail.find('#charaSkill div.connect img').attr('data-nativeimgkey', 'icon_skill_' + selSkill.groupId);
		detail.find('#charaSkill div.connect img').attr('data-src', resBase + 'art/icon_skill_' + selSkill.groupId + '.png');
		//detail.find('#charaSkill div.connect img').attr('src', imageBase + 'art/icon_skill_' + selSkill.groupId + '.png');
		detail.find('#charaSkill div.connect p.name').text(selSkill.name);
		detail.find('#charaSkill div.connect p.detail').text(selSkill.shortDescription);
		// exスキル
		if (selCard.maxPieceSkillId1 != null) {
			console.log(pieceskill);
			var selPieceSkill = pieceskill.data.filter(function (s) { return s.id == selCard.maxPieceSkillId1 })[0];
			console.log(selPieceSkill);
			var pieceSkillDom = $('<div class="commonFrame3 connect">');
			pieceSkillDom.append('<p class="common_title_frame">EX Skill</p>');
			var pieceSkillBox = $('<div class="flexbox">');
			var pieceSkillImgWrap = $('<p class="img">');
			var pieceSkillImg = $('<img>');
			pieceSkillImg.attr('data-nativeimgkey', 'icon_skill_' + selPieceSkill.groupId);
			pieceSkillImg.attr('data-src', resBase + 'art/icon_skill_' + selPieceSkill.groupId + '.png');
			pieceSkillImgWrap.append(pieceSkillImg);
			pieceSkillBox.append(pieceSkillImgWrap);
			var pieceSkillDetail = $('<div class="detailWrap">');
			pieceSkillDetail.append($('<p class="name c_purple">').text(selPieceSkill.name));
			pieceSkillDetail.append('<div class="common_line lc_beige"></div>');
			pieceSkillDetail.append($('<p class="detail">').text(selPieceSkill.shortDescription));
			pieceSkillBox.append(pieceSkillDetail);
			pieceSkillDom.append(pieceSkillBox);

			detail.find('#charaSkill div.command').after(pieceSkillDom);
		}
		// マギア
		detail.find('#charaSkill div.magiaDetail img').attr('data-nativeimgkey', 'icon_skill_' + selMagia.groupId);
		detail.find('#charaSkill div.magiaDetail img').attr('data-src', resBase + 'art/icon_skill_' + selMagia.groupId + '.png');
		detail.find('#charaSkill div.magiaDetail p.name').text(selMagia.name);
		detail.find('#charaSkill div.magiaDetail p.detail').text(selMagia.shortDescription);
		// ドッペル
		if (selCard.doppelMagiaId != null) { 
			var selDoppelMagia = magia.data.filter(function (s) { return s.id == selCard.doppelMagiaId })[0];
			var doppelDom = $('<div class="doppel doppelDetail">');
			var doppelBox = $('<div class="flexBox">');
			var doppelImgWrap = $('<p class="img doppel">');
			var doppelImg = $('<img>');
			doppelImg.attr('data-nativeimgkey', 'mini_' + selCard.doppelCharaNo + '_dd');
			doppelImg.attr('data-src', resBase + 'mini/image/mini_' + selCard.doppelCharaNo + '_dd.png');
			doppelImgWrap.append(doppelImg);
			doppelImgWrap.append('<span class="bg">');
			doppelBox.append(doppelImgWrap);
			var doppelDetail = $('<div class="detailWrap">');
			doppelDetail.append($('<p class="name c_purple">').text(selDoppelMagia.name));
			doppelDetail.append('<div class="common_line lc_beige"></div>');
			doppelDetail.append($('<p class="detail">').text(selDoppelMagia.shortDescription));
			doppelBox.append(doppelDetail);

			doppelDom.append(doppelBox);
			detail.find('div.magia').append(doppelDom);
		}

		// イラスト
		// ディスク
		var diskImg = $('<img>');
		diskImg.attr('data-nativeimgkey', 'card_' + selCard.cardId + '_d');
		diskImg.attr('data-src', resBase + 'card/image/card_' + selCard.cardId + '_d.png');
		//diskImg.attr('src', imageBase + 'card/image/card_' + selCard.cardId + '_d.png');
		for (var i = 1; i <= 5; i++) {
			var diskDom = $('<div class="discWrap">');
			diskDom.addClass(selCard['commandType' + i]);
			diskDom.append('<div class="discText">');
			diskDom.append(diskImg);
			detail.find('#charaIllust .discPreview').append(diskDom.clone());
		}
		_.each(charaCards[selChara.id], function (cd, i) {
			if (!isOwnedUCC(selChara.id, cd.cardId)) { // 所有チェック
				detail.find('.miniCharaBtn').append($('<p class="mb_pink off">★' + cd.rank.split('RANK_')[1] + '</p>'));
			} else {
				selectedClass = cd.cardId == selCard.cardId ? " selected" : "";
				detail.find('.miniCharaBtn').append($('<p data-commandtype="card" data-cardarrindex="' + i + '" class="mb_pink se_decide' + selectedClass + '">★' + cd.rank.split('RANK_')[1] + '</p>'));
			}
		});
		// アイコン
		_.each(charaCards[selChara.id], function (cd, i) {
			var illustIconDiv = $('<div class="cardIllustWrap">');
			if (!isOwnedUCC(selChara.id, cd.cardId)) { // 所有チェック
				illustIconDiv.append($('<div class="offIcon">'));
				illustIconDiv.append($('<p class="mb_pink off">★' + cd.rank.split('RANK_')[1] + '</p > '));
			} else {
				var iconDom = $('<div class="userCharaIcon ' + cd.rank.split('RANK_')[1] + ' ' + cd.attributeId + '">');
				var attKey = 'att_' + cd.attributeId.toLowerCase();
				var starKey = 'star_' + cd.rank.toLowerCase();
				var frameKey = 'frame_' + cd.rank.toLowerCase();
				var cardKey = 'card_' + cd.cardId + '_f';
				var bgKey = 'bg_' + cd.attributeId.toLowerCase();

				var attSrc = resBase + 'card/frame/' + attKey + '.png';
				var starSrc = resBase + 'card/frame/' + starKey + '.png';
				var frameSrc = resBase + 'card/frame/' + frameKey + '.png';
				var cardSrc = resBase + 'card/image/' + cardKey + '.png';
				var bgSrc = resBase + 'card/frame/' + bgKey + '.png';

				iconDom.append($('<span class="att" data-nativebgkey="' + attKey + '" data-src="' + attSrc + '">'));
				iconDom.append($('<span class="star" data-nativebgkey="' + starKey + '" data-src="' + starSrc + '">'));
				iconDom.append($('<span class="rank" data-nativebgkey="' + frameKey + '" data-src="' + frameSrc + '">'));
				iconDom.append($('<img data-nativeimgkey="' + cardKey + '" data-src="' + cardSrc + '">'));
				iconDom.append($('<span class="bg" data-nativebgkey="' + bgKey + '" data-src="' + bgSrc + '">'));

				illustIconDiv.append(iconDom);

				selectedClass = cd.cardId == selCard.cardId ? " selected" : "";
				illustIconDiv.append($('<p data-cardarrindex="' + i + '" class="mb_pink se_decide' + selectedClass + '">★' + cd.rank.split('RANK_')[1] + '</p > '));
			}
			detail.find('.selIllustIcon').append(illustIconDiv);
		});

		// イベント登録
		detailParent.off();
		detailParent.on(common.cgti(), '.collectionBack', closeDetail);
		detailParent.on(common.cgti(), '#detailCardImage .cardImg', cardZoom);
		detailParent.on(common.cgti(), '#detailCardImage .zoomImg', cardZoom);
		detailParent.on(common.cgti(), '#detailTab li[name=status]', changeAbout);
		detailParent.on(common.cgti(), '#detailTab li[name=skill]', changeSkills);
		detailParent.on(common.cgti(), '#detailTab li[name=illust]', changeSetting);
		detailParent.on(common.cgti(), '.moviePlayBtn', charaMoviewPlay);
		detailParent.on(common.cgti(), '.cardIllustWrap .mb_pink', visualChangeCard);
		detailParent.on(common.cgti(), '.miniCharaBtn .mb_pink', visualChangeCommand);

		// 親要素にくっつける
		detailParent.empty().append(detail);

	}

	// 最大レベル取得
	var getMaxLevel = function (rank) {
		switch (rank) {
			case "RANK_1":
				return 40;
			case "RANK_2":
				return 50;
			case "RANK_3":
				return 60;
			case "RANK_4":
				return 80;
			case "RANK_5":
				return 100;
			default:
				return 1;
		}
	};

	// 最大ステータス取得
	var getMaxStatus = function (cd) {
		// 強化後ステータス格納用
		var status = { "attack": Number(cd.attack), "defense": Number(cd.defense), "hp": Number(cd.hp) };

		// ランクによる成長率
		var rankFactor;
		switch (cd.rank) {
			case "RANK_1":
				rankFactor = 2;
			case "RANK_2":
				rankFactor = 2.2;
			case "RANK_3":
				rankFactor = 2.4;
			case "RANK_4":
				rankFactor = 2.6;
			case "RANK_5":
				rankFactor = 3;
		}
		var custom = {};
		switch (cd.growthType) {
			case "BALANCE":
				custom.atk = 1;
				custom.def = 1;
				custom.hp = 1;
				break;
			case "ATTACK":
				custom.atk = 1.03;
				custom.def = 0.97;
				custom.hp = 0.98;
				break;
			case "DEFENSE":
				custom.atk = 0.98;
				custom.def = 1.05;
				custom.hp = 0.97;
				break;
			case "HP":
				custom.atk = 0.97;
				custom.def = 0.98;
				custom.hp = 1.04;
				break;
			case "ATKDEF":
				custom.atk = 1.02;
				custom.def = 1.01;
				custom.hp = 0.99;
				break;
			case "ATKHP":
				custom.atk = 1.01;
				custom.def = 0.99;
				custom.hp = 1.02;
				break;
			case "DEFHP":
				custom.atk = 0.99;
				custom.def = 1.02;
				custom.hp = 1.01;
				break;
		}

		status.attack = (status.attack + (status.attack * rankFactor * custom.atk) | 0);
		status.defense = (status.defense + (status.defense * rankFactor * custom.def) | 0);
		status.hp = (status.hp + (status.hp * rankFactor * custom.hp) | 0);

		return status;
	}

	// カスタムステータス修正値
	var customStatus = function (growType) {
		var custom = {};

		switch (growType) {
			case "BALANCE":
				custom.atk = 1;
				custom.def = 1;
				custom.hp = 1;
				break;
			case "ATTACK":
				custom.atk = 1.03;
				custom.def = 0.97;
				custom.hp = 0.98;
				break;
			case "DEFENSE":
				custom.atk = 0.98;
				custom.def = 1.05;
				custom.hp = 0.97;
				break;
			case "HP":
				custom.atk = 0.97;
				custom.def = 0.98;
				custom.hp = 1.04;
				break;
			case "ATKDEF":
				custom.atk = 1.02;
				custom.def = 1.01;
				custom.hp = 0.99;
				break;
			case "ATKHP":
				custom.atk = 1.01;
				custom.def = 0.99;
				custom.hp = 1.02;
				break;
			case "DEFHP":
				custom.atk = 0.99;
				custom.def = 1.02;
				custom.hp = 1.01;
				break;
		}


		return custom;
	}
	// list表示
	function closeDetail() {
		$('#mainContent').removeClass('hide');
		$('#cardDetail').addClass('hide');
		changeAbout();
	}

	// detail tab切り替え1
	function changeAbout() {
		$('#cardDetailWrap').removeClass();
		$('#cardDetailWrap').addClass('status');
		$('#detailTab').find('[name=skill]').removeClass('current');
		$('#detailTab').find('[name=illust]').removeClass('current');
		$('#detailTab').find('[name=status]').addClass('current');
	}

	// detail tab切り替え2
	function changeSkills() {
		$('#cardDetailWrap').removeClass();
		$('#cardDetailWrap').addClass('skill');
		$('#detailTab').find('[name=status]').removeClass('current');
		$('#detailTab').find('[name=illust]').removeClass('current');
		$('#detailTab').find('[name=skill]').addClass('current');
	}

	// detail tab切り替え3
	function changeSetting() {
		$('#cardDetailWrap').removeClass();
		$('#cardDetailWrap').addClass('illust');
		$('#detailTab').find('[name=status]').removeClass('current');
		$('#detailTab').find('[name=skill]').removeClass('current');
		$('#detailTab').find('[name=illust]').addClass('current');
	}

	// card押下時
	function cardZoom(event) {
		$('#detailCardImage').toggleClass('zoom');
	}

	// カード切り替え
	function visualChangeCard(e) {
		e.preventDefault();

		var target = e.currentTarget

		var charaId = $('#cardDetail').attr('chara-id');
		var cds = charaCards[charaId];
		var cd = cds[target.dataset.cardarrindex];

		var cardId = cd.cardId;
		var attributeId = cd.attributeId;
		var rank = cd.rank;
		var illustrator = cd.illustrator;
		var rankNum = rank.split('RANK_')[1];

		$('.cardIllustWrap .selected').removeClass('selected');
		$(target).addClass('selected');

		var cardImgElm = $('#detailCardImage .cardImg')[0];
		var cardFrameElm = $('#detailCardImage .cardFrame')[0];
		var zoomCardImgElm = $('#detailCardImage .zoomImg')[0];

		var cardRank = 'frame_' + attributeId.toLowerCase() + '_' + rank.toLowerCase();
		cardImgElm.dataset.nativeimgkey = 'card_' + cardId + '_c';
		cardImgElm.dataset.src = 'resource/image_native/card/image/card_' + cardId + '_c.png';
		cardImgElm.src = './magica/resource/image_native/card/image/card_' + cardId + '_c.png';
		zoomCardImgElm.dataset.nativeimgkey = 'card_' + cardId + '_c';
		zoomCardImgElm.dataset.src = 'resource/image_native/card/image/card_' + cardId + '_c.png';
		zoomCardImgElm.src = './magica/resource/image_native/card/image/card_' + cardId + '_c.png';
		cardFrameElm.dataset.nativebgkey = cardRank;
		cardFrameElm.dataset.src = 'resource/image_native/card/frame/' + cardRank + '.png';
		cardFrameElm.style = 'background-image: url("./magica/resource/image_native/card/frame/' + cardRank + '.png")';

		$('.illustrator')[0].textContent = illustrator;
		$('.selIllustTitle')[0].textContent = '★' + rankNum + ' 插畫:';
		cmd.getBaseData(common.getNativeObj());
	}


	// ディスク切り替え
	function visualChangeCommand(e) {
		e.preventDefault();

		var target = e.currentTarget;

		if (target.classList.contains('off') || target.classList.contains('selected')) return;

		$('.miniCharaBtn .selected').removeClass('selected');
		$(target).addClass('selected');
		var idx = (target.dataset.cardarrindex) ? target.dataset.cardarrindex : 0;
		var charaId = $('#cardDetail').attr('chara-id');
		var cds = charaCards[charaId];
		var cd = cds[idx];
		var cardId = cd.cardId;
		var miniCharaNo = cd.miniCharaNo;

		var model;
		if (target.dataset.commandtype == 'chara') {
			model = {
				commandType: 'CHARA',
				path: 'mini/image/',
				visualId: 'mini_' + miniCharaNo + '_d',
				idNum: Number(miniCharaNo)
			};
		} else {
			model = {
				commandType: 'CARD',
				path: 'card/image/',
				visualId: 'card_' + cardId + '_d',
				idNum: Number(cardId)
			};
		}

		var commandImgElms = $('.discPreview .discWrap img');

		$.each(commandImgElms, function (index, elm) {
			elm.dataset.nativeimgkey = model.visualId;
			elm.dataset.src = resBase + model.path + model.visualId + '.png';
			//elm.src = imageBase + model.path + model.visualId + '.png';
		});
		cmd.getBaseData(common.getNativeObj());
	}


	// movie再生
	function charaMoviewPlay(e) {
		if (common.isScrolled()) return;

		common.androidKeyStop = true;

		cmd.stopVoice();
		var charaId = $('#cardDetail').attr('chara-id');

		$(common.ready.target).on('webkitAnimationEnd', function () {
			cmd.changeBg('web_black.jpg');

			$(common.ready.target).off();

			$(common.ready.target).on('webkitAnimationEnd', function (e) {
				if (e.originalEvent.animationName == 'readyFadeOut') {
					$(common.ready.target).attr('class', '');
				}
			});

			$('#commandDiv').on('nativeCallback', function (e, res) {
				common.androidKeyStop = false;

				$(common.ready.target).attr('class', 'nativeFadeOut');

				cmd.startBgm(common.bgm);
				cmd.changeBg(common.background);

				cmd.setWebView();
				$('#commandDiv').off();
			});

			setTimeout(function () {
				cmd.setWebView(false);
				cmd.stopBgm();
				cmd.playCharaMovie(charaId);
				setTimeout(function () {
					$(common.ready.target).attr('class', '');
					$(common.ready.target).trigger('nativeFadeOut');
				}, 1000)
			}, 500);
		});

		common.ready.target.addClass('preNativeFadeIn');
	}

	function tabFunc(e) {
		e.preventDefault();
		if (common.isScrolled()) return;

		var att = e.currentTarget.getAttribute("data-att").toLowerCase();
		var charaWrap = $("#charaWrap");
		charaWrap.attr('class', att + " commonFrame2");

		$(".tabBtns .current").removeClass("current");
		$(e.currentTarget).addClass("current");

		//common.scrollRefresh(null, null, true);
		cmd.stopVoice();
	}
});