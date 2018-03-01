function Controller(){

    this.questionBank = function(questionsObj){
        var qBank = [];
        for(key in questionsObj){
                var maxQ = 3;
                if(key==='easy'){
                    maxQ=4
                }
                for(var sub_i=0;sub_i<maxQ;sub_i++){
                    var qEntry = questionsObj[key].shift();
                    var qA = {
                        question: qEntry.question,
                        category: qEntry.category,
                        difficulty: qEntry.difficulty,
                        correct_answer: qEntry.correct_answer,
                        incorrect_answers: [qEntry.incorrect_answers[0],qEntry.incorrect_answers[1],qEntry.incorrect_answers[2]]
                    };
                    qBank.push(qA)
                }
            }
        game.questionBank = qBank;
        game.view.renderQuestion(game.questionBank);

    };


  this.dealDamage = function(amount){
    game.damageBank = null;
    game.turn === 1
    ? game.players[game.turn + 1]['hitPoints'] -= amount
    : game.players[game.turn - 1]['hitPoints'] -= amount;
    var hpTarget= null;
    if(game.turn===1){
        hpTarget = game.players[2]['hitPoints'];
        $('.dmg-meter-left').text('0');
    }else{
        hpTarget = game.players[1]['hitPoints']
        $('.dmg-meter-right').text('0');
    }
    game.view.renderDmg(hpTarget);
    if(game.questionBank===0 || game.players['1']['hitPoints']<=0 ||  game.players['2']['hitPoints']<=0){
        this.checkWinState();
    }

  };

  this.dmgCalculator = function(difficulty, boolean){
      var damagePercent = 0;
      if(boolean){
          damagePercent+=5;
      }
      switch (difficulty){
          case 'easy':
              damagePercent+=3;
              break;
          case 'medium':
              damagePercent+=6;
              break;
          case 'hard':
              damagePercent+=9;
              break;
      }
    if(game.dmgMultiplier === 0){
        return damagePercent
    }else{
        return parseInt(damagePercent*game.dmgMultiplier)
    }
  };

  this.getSessionToken = function(){  //avoids receiving same question w/in 6 hour period
      $.ajax({
          method: 'GET',
          dataType: 'JSON',
          url: 'https://opentdb.com/api_token.php',
          data: {
            command: 'request'
          },
          success: function(data){
             if(data.response_code ===0 ){
                game.token = data.token;
                game.controller.buildQuestionShoe();
             }else{
                 console.error('server response'+ data.response_code +" "+data.response_message);
             }
          },
          error: function(){
              console.warn('error input');
          }
      });
  };

  this.checkWinState = function() {

      if (game.players['1']['hitPoints'] <= 0 || game.players['2']['hitPoints'] <= 0) {
          game.gameState = 'endgame';
          game.view.showEndgameWinner();
      }else{
          if (game.turn === 1) {
              game.turn += 1;
              $('.player1 > .dmg').hide();
          } else {
              game.turn -= 1;
              $('.player2 > .dmg').hide();
          }
          $('.readyBanner').slideDown('slow');
      }

  };

    this.retrieveQuestions = function (diff) {
      $.ajax({
          method: 'GET',
          dataType: 'JSON',
          data: {
              'amount': 50,
              difficulty: diff,
              type: 'multiple',
              token: game.token
          },
          url: 'https://opentdb.com/api.php',
          success: function (data) {
              if (data.response_code === 0) {
                  game.questions[diff] = data.results;
              } else {
                  alert('Issue with question retrieval. Response code: ' + data.response_code);
              }
          },
          error: function () {
              console.warn('error input');
          }
      });
    };


    this.buildQuestionShoe = function () {
      var difficulty = ['easy', 'medium', 'hard'];

      difficulty.forEach((element) => {
          this.retrieveQuestions(element);
      });

    };


    this.getCharacterInfo = function (character) {
        var loadingTimeout = setTimeout(function(){
            $('.loading-error').css('display','block');
        }, 10000);
        $.ajax({
            method: 'post',
            url: 'resources/proxy.php',
            dataType: 'json',
            data: {
                url: 'http://superheroapi.com/api.php/10159579732380612/'+ game.availableCharacters[character].heroID
            },
            success: function (data) {
                game.apiResponse++;
                $('.loadingBar').css('width', game.apiResponse * 7.5 + 17.5 + '%');
                game.availableCharacters[character].characterInfo = data;

                if (game.apiResponse >= 12){
                  $('.modalContainer').show( 1 );
                  $('.loadScreen').hide( 1 );
                }
                clearTimeout(loadingTimeout);
            },
            error: function () {
                console.warn('Connection issue retrieving of superhero data');
            }
        });

    };

    this.buildCharacterInfo = function() {
        for (var character in game.availableCharacters) {
            this.getCharacterInfo(character);
        }
    };

    this.getQuote = function(winner, winnerImg, winnerSex) {
        var categories = ["dev","movie","food","celebrity","science","political","sport","animal","music","history","travel","career","money","fashion"];
        var randomNum = Math.floor(Math.random() * categories.length);
        var randomCategory = categories[randomNum];
        game.winnerQuote = false;


        $.ajax({
            method: 'get',
            url: 'https://api.chucknorris.io/jokes/random',
            dataType: 'json',
            data: {'category': randomCategory},
            success: function (quote) {
                var chuckNorrisQuote = quote.value;
                var regEx = /(chuck norris)|\bchuck|\bnorris/ig  //find the word 'chuck norris' in a quote no matter if it's uppercase or lowercase
                var winnerQuote = chuckNorrisQuote.replace(regEx, winner); //change the word 'chuck norris' with winner's name

                if(winnerSex === 'Female'){  //if the sex of the winner is female, change the words 'his' and 'he' to 'her' and 'she'
                    var regExHe = /\bhe/ig;
                    winnerQuote = winnerQuote.replace(regExHe, 'she');

                    var regExHis = /\bhis/ig;
                    winnerQuote = winnerQuote.replace(regExHis, 'her');

                    var regExHim = /\bhim/ig
                    winnerQuote = winnerQuote.replace(regExHim, 'her');

                }

                // find all winner's name and color it to lime green;
                var findTheName = winner;
                var replaceAllName = new RegExp(findTheName, 'g');
                var greenTxt = winnerQuote.replace(replaceAllName, winner.fontcolor('limegreen'));//makes font tag to change color of the name

                $('.chuckNorrisQuote p').append(greenTxt);
                $('.winningCharacter').css('background-image', 'url("resources/images/characters/' + winnerImg + '")');
            },
            error: function () {
                console.warn('something went wrong!');
            }
        });
    };

  this.selectAnswer = function (element) {
      var specialty = false;
      if (element.answer === 'correct') {
        game.dmgMultiplier < 4 ? game.dmgMultiplier += 1 : game.dmgMultiplier = 4;
        game.view.renderMultiplier();
        if (element.category === game.players[game.turn].character.category) {
            specialty = true;
        }
        this.addDamage(this.dmgCalculator(element.difficulty, specialty));
      }else if(element.answer !== 'correct'){
        this.reduceDamage(this.dmgCalculator(element.difficulty, specialty));
      }
      game.view.renderComboButton()
      game.view.renderQuestion(game.questionBank);
  };

  this.addDamage = function(amount){
    if(game.turn === 1){

        game.damageBank += amount;
        $('.dmg-meter-left').text(game.damageBank);
        $('.showDmg-left').text('+'+amount);
        $('.showDmg-left').fadeIn("fast");
        $('.showDmg-left').fadeOut("slow");

    }else{
        game.damageBank += amount
        $('.dmg-meter-right').text(game.damageBank);
        $('.showDmg-right').text('+'+amount);
        $('.showDmg-right').fadeIn("fast");
        $('.showDmg-right').fadeOut("slow");
    }
  }

  this.reduceDamage = function(amount){
    if(game.damageBank < 0) return null;

    if(game.turn === 1){
        if(game.damageBank < amount){
            game.damageBank = null;
        }else{
           game.damageBank -= amount;
        }
        $('.dmg-meter-left').text(game.damageBank);
        $('.showDmg-left').text('-'+amount).fadeIn().fadeOut("slow");
    }else{
        if(game.damageBank < amount){
            game.damageBank = null;
        }else{
           game.damageBank -= amount;
        }
        $('.dmg-meter-right').text(game.damageBank);
        $('.showDmg-right').text('-'+amount).fadeIn().fadeOut("slow");
    }
    game.dmgMultiplier = 0;
    game.view.renderMultiplier();
  }

  this.lastDamage = function(){
    this.dealDamage(game.damageBank);
    game.damageBank = null;
    $('.dmg-meter-right').text('');
    $('.dmg-meter-left').text('');
  }

  this.domParser = function (input) {
      var doc = new DOMParser().parseFromString(input, "text/html");
      return doc.documentElement.textContent;
  }

}
