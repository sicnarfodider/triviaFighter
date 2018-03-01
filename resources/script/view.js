function View(){
  //all of our functions for updating the view will go here

    this.showEndgameWinner = function() {
        clearInterval(game.roundTimer);
        $('.readyButton span').text('P1');
        var winner;
        var winnerImg;

        if (game.players['1']['hitPoints'] > 0) {
            winner = game.players['1']['character']['name'];
            winnerImg = game.players['1']['character']['img']
            winnerSex = game.players[1]['character']['characterInfo']['appearance']['gender'];
        } else {
            winner = game.players['2']['character']['name'];
            winnerImg = game.players['2']['character']['img']
            winnerSex = game.players[2]['character']['characterInfo']['appearance']['gender'];
        }

        if(game.winnerQuote){
            game.controller.getQuote(winner, winnerImg, winnerSex);
        }


        $('.gameBoard').fadeOut(1500);
        $('.winnerModal').fadeIn(1500);

    };

    this.renderQuestion = function(qArray){ //renders Question and answers into Arena
        $('.answer').remove();
        if(game.questions.easy.length < 10 ){
            game.controller.buildQuestionShoe();
        }
        if(game.questionBank.length===0){
            game.controller.lastDamage();
            $('.questionModal').removeClass('questionModalShow');
            clearInterval(game.roundTimer);
            //wincheckstate & player change
            if(game.turn===1){
                $('.readyButton span').text('P2')
            }else{
                $('.readyButton span').text('P1')
            }
            game.controller.checkWinState();
            return;
        }
        var entry = qArray.shift();
        var difficulty = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);
        var question = game.controller.domParser(entry.question);//parses html entities from api string
        var ansList = entry.incorrect_answers; //array of incorrect answers
        var correctAns = entry.correct_answer;
        var randomNum = Math.floor(Math.random()*4);
        ansList.splice(randomNum,0, correctAns);
        var catSpan = $('<span>',{
            text: difficulty +": "+ entry.category,
            'class': 'category'
        });
        $('.questionContainer p').text(question).append(catSpan);
        for(var ans_i=0;ans_i<ansList.length;ans_i++){
            this.createAnsDiv(ans_i,ansList[ans_i], entry);
        }
    };

    this.createAnsDiv = function(num,text, entry){
        var ansDiv= $('<div>',{
            id: 'q'+num,
            'class': 'answer',
            text: game.controller.domParser(text)
        });
        ansDiv[0].difficulty = entry.difficulty;
        ansDiv[0].category = entry.category;
        if(text!==entry.correct_answer){ //stores correct and incorrect properties inside the DOM element
            ansDiv[0].answer= 'incorrect';
        }else{
            ansDiv[0].answer = 'correct'
        }
        $('.questionModal').append(ansDiv)
    };

    this.renderDmg = function(amount){
        if(game.turn === 1){
            currentHpBar = $('.right');

        }else{
            currentHpBar = $('.left');
        }
        currentHpBar.css('width', amount+"%") //reduces the width by the percentage of the dmg.
    };

    this.addOutlineToSelectedPlayer = function(){
        $(event.target).addClass('playerAvatarClicked');
    };

    this.activePlayButton = function(){

        game.playButtonClickable = true;
        $('.row:last-child').addClass('readyPlayButton');
        $('.playButton').click(function(){
            if(game.playButtonClickable) {
              game.playButtonClickable = false;
              game.avatarClickable = false;
              game.turn = 1;
              game.view.renderComboButton()


              $('.modalContainer').hide();
              $('.p1name').text(game.players[1].character.name);
              $('.p2name').text(game.players[2].character.name);
              $('.gameBoard').show();
              $('.readyBanner').show('slow');

              // add function that triggers game start/load screen
            }
        });
        this.renderHeroInArena(game.players);
    };

    this.handleAvatarHover = function (){
        $('.playerAvatar').hover(function () {
            if (game.bothPlayersSelected === false) {
                var characterImg = $(event.target).attr('id');
                if (game.turn === 1) {
                    $('.playerContainerLeft').css('background-image', "url('resources/images/characters/" + game.availableCharacters[characterImg].img + "')");
                    $('.characterNameLeft').text(game.availableCharacters[characterImg].name);
                    $('.infoHeaderName').text('Real Name: ');
                    $('#realNameLeft').text(game.availableCharacters[characterImg].characterInfo.biography['full-name']);
                    $('.infoHeaderPower').text('Power: ');
                    $('#categoryIDLeft').text(game.availableCharacters[characterImg].category);
                    $('.infoHeaderOccupation').text('Occupation: ');
                    $('#occupationLeft').text(game.availableCharacters[characterImg].characterInfo.work.occupation.split(',')[0]);
                } else {
                    $('.playerContainerRight').css('background-image', "url('resources/images/characters/" + game.availableCharacters[characterImg].img + "')");
                    $('.characterNameRight').text(game.availableCharacters[characterImg].name);
                    $('.infoHeaderNameRight').text('Real Name: ');
                    $('#realNameRight').text(game.availableCharacters[characterImg].characterInfo.biography['full-name']);
                    $('.infoHeaderPowerRight').text('Power: ');
                    $('#categoryIDRight').text(game.availableCharacters[characterImg].category);
                    $('.infoHeaderOccupationRight').text('Occupation: ');
                    $('#occupationRight').text(game.availableCharacters[characterImg].characterInfo.work.occupation.split(',')[0]);
                }
            }
        }, function () {
            if (game.turn === 1) {
                $('.playerContainerLeft').removeClass('playerPhotoLeft');
            } else {
                $('.playerContainerRight').removeClass('playerPhotoRight');
            }
        });
    };

    this.renderHeroInArena = function(players){   //renders each players img to main game board arena
        $('.player1').css('background-image', 'url("resources/images/characters/'+ players[1].character.img+'")');
        $('.player2').css('background-image', 'url("resources/images/characters/'+ players[2].character.img+'")');
    };

    this.renderTimer = function(){   // renders the timer for each player
        game.roundTimer  = setInterval(function() {
            game.roundTime--;
            game.roundTime <= 10 ? $('.timer').addClass('lastTen') : $('.timer').removeClass('lastTen')
            $('.currentTime').text(game.roundTime);
            if(game.roundTime===0){
                clearInterval(game.roundTimer);
                game.dmgMultiplier = 0;
                game.view.renderMultiplier();
                $('.questionModal').removeClass('questionModalShow');
                    game.damageBank = null;
                    $('.dmg-meter-right').text('0');
                    $('.dmg-meter-left').text('0');
                if(game.turn===1){
                    game.turn=2;
                    $('.readyButton span').text('P2');
                    $('.player1 > .dmg').hide();
                }else{
                    game.turn=1;
                    $('.readyButton span').text('P1');
                    $('.player2 > .dmg').hide();
                }
                $('.readyBanner').show();
                }
        }, 1000);
    }

    this.playerTurn = function (){
        if(game.turn === 1){
            $('.p2name').removeClass('currentPlayerTurn');
            $('.p1name').addClass('currentPlayerTurn');
            $('.player1 .dmgBtn').addClass('ready');
            $('.player2 .dmgBtn').removeClass('ready');
            $('.player1 > .dmg').css('display','flex');
            $('.player2 > .dmg').hide();
        } else {
            $('.p1name').removeClass('currentPlayerTurn');
            $('.p2name').addClass('currentPlayerTurn');
            $('.player2 .dmgBtn').addClass('ready');
            $('.player1 .dmgBtn').removeClass('ready');
            $('.player2 > .dmg').css('display','flex');
            $('.player1 > .dmg').hide();
        }

    }

    this.renderComboButton = function(){
        var p1 = $('.dmgBtn[player="p1"]');
        var p2 = $('.dmgBtn[player="p2"]');
        if(game.damageBank>0){
            if(game.turn === 1){
                p1.css('opacity','1')
            }else{
                p2.css('opacity','1')
            }
        }else{
            $('.dmgBtn').css('opacity','0');
        }
    }

    this.renderMultiplier = function(){
        if(game.dmgMultiplier>0){
            if(game.turn === 1){
                $(".p1.combo-box[multiplier="+game.dmgMultiplier+"]").addClass('on');
            }else{
                $(".p2.combo-box[multiplier="+game.dmgMultiplier+"]").addClass('on');
            }
        }else{
            $('.combo-box').removeClass('on');

        }
    }

}
