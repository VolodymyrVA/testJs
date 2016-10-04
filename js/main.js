
$(function () {
    'use strict';

    var cookieModule = (function () {
        return{
            setCookie: function (name, value, options) {
                options = options || {};

                var expires = options.expires;

                if (typeof expires === "number" && expires) {
                    var d = new Date();
                    d.setTime(d.getTime() + expires * 1000);
                    expires = options.expires = d;
                }
                if (expires && expires.toUTCString) {
                    options.expires = expires.toUTCString();
                }

                value = encodeURIComponent(value);

                var updatedCookie = name + "=" + value;

                for (var propName in options) {
                    updatedCookie += "; " + propName;
                    var propValue = options[propName];
                    if (propValue !== true) {
                        updatedCookie += "=" + propValue;
                    }
                }

                document.cookie = updatedCookie;
            },
            deleteCookie: function(name) {
                cookieModule.setCookie(name, "", {
                    expires: -1
                })
            },
            getCookie: function getCookie(name) {
                var matches = document.cookie.match(new RegExp(
                    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ));
                return matches ? decodeURIComponent(matches[1]) : undefined;
            }
        }
    })();


    var viewModule = (function () {
        return {

            setContent: function (arr) {
                var json = JSON.stringify(arr);
                json = JSON.parse(json);
                $("#content").empty();
                var template = Handlebars.compile($('#contentItemTemplate').html());
                $('#content').append(template(json));
            }
        }
    })();

    var selectionModule = (function () {
        return {

            hiddenVisible: function () {
                var appWrapper = $('.app-wrapper');
                $(appWrapper).click(function (e) {
                    e.preventDefault();
                    var targ = $(e.target).attr('class'),
                        formRegistration = $('.form-registration'),
                        formLogIn = $('.form-log-in'),
                        info = $('.info');
                    if(targ === 'reg'){
                        $(info).empty();
                        if(formRegistration.hasClass('hidden')){
                            if(!formLogIn.hasClass('hidden')){
                                formRegistration.removeClass('hidden');
                                formLogIn.addClass('hidden');
                            }else {
                                formRegistration.removeClass('hidden');
                            }

                        }else {
                            formRegistration.addClass('hidden');
                        }
                    }
                    if(targ === 'log'){
                       $(info).empty();
                       if(formLogIn.hasClass('hidden') ){
                           if(!formRegistration.hasClass('hidden')){
                               formLogIn.removeClass('hidden');
                               formRegistration.addClass('hidden');
                           }else {
                               formLogIn.removeClass('hidden');
                           }

                       } else {
                           formLogIn.addClass('hidden');
                       }
                    }
                });
            }

        }
    })();
    selectionModule.hiddenVisible();

    var localStorageModule = (function () {
        return{

            registration: function () {
                var registration = $('.form-registration'),
                    info = $('.info');

                $(registration).click(function (e) {
                    e.preventDefault();
                    $(info).empty();

                    var targ = $(e.target).attr('id');

                    if(targ === 'btRegistration'){
                        var emailVal = $('.registration-email').val(),
                            passwordVal = $('.registration-password').val();

                        if(validationModule.formRegistration(emailVal, passwordVal)){
                            var encryptPassword = encryptModule.encrypt(passwordVal),
                                userPassword = JSON.stringify(encryptPassword),
                                saveLS = localStorage.setItem(emailVal, userPassword);
                        }

                    }
                });
            },
            logIn: function () {
                var logIn = $('.form-log-in'),
                    info = $('.info'),
                    button = $('.log'),
                    content = $('#content'),
                    main = $('.app-main'),
                    exit = '<button id="exit" class="button-form" type="button">Exit</button>',
                    getCookie = cookieModule.getCookie('user');
                    console.log(getCookie)
                    if (getCookie) {
                        var obj = localStorage.getItem('user'),
                            jsonObj = JSON.parse(obj);

                        logIn.empty();
                        logIn.append($('.edit'));
                        button.text('edit');
                        content.removeClass('hidden');
                        main.append(exit);
                        viewModule.setContent(jsonObj);
                        return true;

                    } else {
                        $(logIn).click(function (e) {
                            e.preventDefault();
                            $(info).empty();

                            var targ = $(e.target).attr('id');

                            if (targ === 'btlog') {
                                var reason = "",
                                    ls = localStorage,
                                    i,
                                    emailVal = $('.log-in-email').val(),
                                    passwordVal = $('.log-in-password').val(),
                                    aside = $('.app-aside'),
                                    editForm = $('#editForm');

                                for (i = 0; i < ls.length; i++) {
                                    var key = ls.key(i),
                                        keyItem = ls.getItem(key);

                                    if (key === emailVal) {
                                        var userEmail = key,
                                            json = JSON.parse(keyItem),
                                            userPassword = encryptModule.unEncrypt(json);
                                    }
                                }

                                if (emailVal === "") {
                                    reason += "Error email - empty field !  ";
                                }
                                else if (userEmail === undefined) {
                                    reason += "Error - invalid email!  ";
                                }
                                else if (passwordVal === "") {
                                    reason += "Error password - empty field !  ";
                                }
                                else if (userPassword === undefined) {
                                    reason += "Error - incorrect password!  ";
                                }

                                if (reason === '') {
                                    cookieModule.setCookie('user', emailVal);
                                    logIn.empty();
                                    logIn.append($('.edit'));
                                    button.text('edit');
                                    content.removeClass('hidden');
                                    main.append(exit);
                                    viewModule.setContent(data);
                                    return true;
                                }
                                else {
                                    $(info).html(reason).css({'color': '#f54440'});
                                    return false;
                                }
                            }
                        });
                    }
            }
        }
    })();
    localStorageModule.registration();
    localStorageModule.logIn();

    var validationModule = (function () {
        return {

            formRegistration: function (currValEmail, currValPassword) {
                var reason = "",
                    patternEmail = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i),
                    patternPassword = new RegExp(/^([1-zA-Z0-1@.\s]{1,255})$/),
                    info = $('.info'),
                    myForm = $('.myform');

                if (currValEmail === "") {
                    reason += "Error email - empty field !  ";
                }
                else if(!patternEmail.test(currValEmail)){
                    reason += "Error invalid email!  ";
                }
                else if (currValPassword === "") {
                    reason += "Error password - empty field !  ";
                }
                else if(!patternPassword.test(currValPassword)){
                    reason += "Error password - characters are not allowed!  ";
                }

                if (reason === "") {
                    $(info).html('Registration completed successfully!').css({'color':'#AEE8A7'});
                    myForm.trigger( 'reset' );
                    return true;
                }
                else {
                    $(info).html(reason).css({'color': '#f54440'});
                    return false;
                }
            }

        }
    })();

    var encryptModule = (function () {
        return {

            encrypt: function (theText) {
                var output = new String,
                    Temp = new Array(),
                    Temp2 = new Array(),
                    TextSize = theText.length,
                    i,
                    rnd;
                for (i = 0; i < TextSize; i++) {
                    rnd = Math.round(Math.random() * 122) + 68;
                    Temp[i] = theText.charCodeAt(i) + rnd;
                    Temp2[i] = rnd;
                }
                for (i = 0; i < TextSize; i++) {
                    output += String.fromCharCode(Temp[i], Temp2[i]);
                }
                return output;
            },

            unEncrypt: function (theText) {
                var output = new String,
                    Temp = new Array(),
                    Temp2 = new Array(),
                    TextSize = theText.length,
                    i;

                for (i = 0; i < TextSize; i++) {
                    Temp[i] = theText.charCodeAt(i);
                    Temp2[i] = theText.charCodeAt(i + 1);
                }
                for (i = 0; i < TextSize; i = i+2) {
                    output += String.fromCharCode(Temp[i] - Temp2[i]);
                }
                return output;
            }
            
        }
    })();


    var informationChanges = (function () {
        return {

            getInputData:function () {
                var formLog = $('#edit'),
                    info = $('.info'),
                    myForm = $('.myform');

                $(formLog).click(function (e) {
                    e.preventDefault();
                    info.empty();
                    var targ = $(e.target).attr('id');
                    if(targ === 'change'){
                        var img = $('#imgs').val(),
                            name = $('#name').val(),
                            surname = $('#surname').val(),
                            age = $('#age').val(),
                            country = $('#country').val(),
                            job = $('#job').val(),
                            userObj = {
                                'img': img,
                                'name': name,
                                'surname': surname,
                                'age': age,
                                'country': country,
                                'job': job
                            },
                            json = JSON.stringify(userObj),
                            reason = '';

                        if(img === '' || !(/^data:image/).test(img)){
                            reason += 'Img - empty line / incorrect URL ';
                        }
                        else if(name === '' || !(/^[a-zA-Z]+$/).test(name)){
                            reason += 'Name - empty line / only letters  ';
                        }
                        else if(surname === '' || !(/^[a-zA-Z]+$/).test(surname)){
                            reason += 'Surname - empty line / only letters  ';
                        }
                        else if(age === '' || !(/^[0-9-]+$/).test(age)){
                            reason += 'Age - empty line / only numbers  ';
                        }
                        else if(country === '' || !(/^[a-zA-Z]+$/).test(country)){
                            reason += 'Country - empty line / only letters  ';
                        }
                        else if(job === '' || !(/^[a-zA-Z]+$/).test(job)){
                            reason += 'Job - empty line / only letters ';
                        }
                        if(reason === ''){
                            var createSession = localStorage.setItem('user', json);
                            myForm.trigger( 'reset' );
                            viewModule.setContent(userObj);
                        }else {
                            $(info).html(reason).css({'color': '#f54440'});
                            return false;
                        }
                    }
                });
            },
            exit:function () {
                var main = $('.app-main');
                $(main).click(function (e) {
                    e.preventDefault();
                    var targ = $(e.target).attr('id');
                    if (targ === 'exit') {
                        cookieModule.deleteCookie('user');
                        location.reload();
                    }
                });
            }


        }
    })();
    informationChanges.getInputData();
    informationChanges.exit();
});