$(document).ready(function () {

    //tmdb api 연결
    var tmdbApiKey = "0a0e9917cc5e1abde234fad4c8fa2775"
    var genreKey = `https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbApiKey}&language=en-US`

    //장르DB 가져오기+필터에 장르 id속성 삽입
    var genreData = new Array;
    var filterGenre = new Array;
    fetch(genreKey)
        .then(function (res) {
            return res.json();
        }).then(function (json) {
            var genreLeng = json.genres.length; ///DB의 장르 갯수
            for (i = 0; i < genreLeng; i++) {
                genreData.push(json.genres[i].name); //DB의 장르 갯수만큼 배열에 PUSH
                var genreId = json.genres[i].id;
                var filterLeng = $(".filter-box>li").length; //장르 필터의 갯수
                for (j = 1; j < filterLeng; j++) { //all은 제외
                    var filterVal = $(".filter-box>li").eq(j).children("input").val();
                    filterGenre.push(filterVal);
                    var includesOrNot = filterGenre.includes(genreData[i]); //BOX 안의 장르명의 DB 배열 포함여부 체크
                    //includes, if문으로 매칭작업
                    if (includesOrNot) {
                        $(".filter-box>li").eq(j).children("input").attr("data-id", genreId); //장르id를 속성값으로 부여
                        break; //체크여부 순환해보고 포함된 게 있으면 순환 중단하고 out
                    }
                }
            }
        });
    //장르DB 핸들링 END

    //필터링 작업
    //(1)장르에 따라 필터링(체크박스 활용)
    var userSelectGenre = new Array;
    //필터영역에서 셀렉트된 장르 가져오기>배열화
    $(".filter-box input").on("change", function () {
        var genreId = $(this).attr("data-id"); //장르번호
        var genreCheck = $(this).is(":checked"); //체크박스 체크여부
        if (genreCheck == true) {
            userSelectGenre.push(genreId); //장르가 체크되면 배열에 담기
        } else {
            userSelectGenre.splice(userSelectGenre.indexOf(genreId), 1); //체크해제시 배열에서 삭제
        }
        userSelectGenre = userSelectGenre.map(function (item) {
            return Number(item);
        }) //장르id 숫자화
        if (genreId == undefined) {
            var genreLeng = $(".filter-box li").length;
            for (i = 1; i < genreLeng; i++) {
                $(".filter-box li").eq(i).children("input").prop("checked", false);
            } //all 체크시 기타 장르 체크해제
        } else {
            $(".filter-box li").eq(0).children("input").prop("checked", false);
        } //기타장르 체크시 all 체크 해제
    });

    ///////검색결과 나열////////
    //검색창에 검색어 입력시 이벤트☆
    $("#search-form").on("submit", function (e) {
        e.preventDefault()
        var searchKeyword = $("#search-form input").val();
        var selectedOption = $("#search-form>select>option:selected").text();
        var movieKey = `https://api.themoviedb.org/3/search/movie?query=${searchKeyword}&api_key=${tmdbApiKey}`
        var actorKey = `https://api.themoviedb.org/3/search/person?query=${searchKeyword}&api_key=${tmdbApiKey}`

        if (selectedOption == "Movie") { //영화명으로 검색결과 나열

            fetch(movieKey)
                .then(function (res) {
                    return res.json();
                })
                .then(function (myJson) {
                    console.log(myJson);
                    var resultLeng = myJson.results.length;
                    $(".search-result").children().remove();
                    for (i = 0; i < resultLeng; i++) {
                        for (j = 0; j < userSelectGenre.length; j++) {
                            var movieRate = myJson.results[i].vote_average;
                            var moviePoster = myJson.results[i].poster_path;
                            var movieTitle = myJson.results[i].title;
                            var movieDate = myJson.results[i].release_date;
                            var movieOverview = myJson.results[i].overview;
                            var movieGenre = myJson.results[i].genre_ids;
                            var includesOrNot = movieGenre.includes(userSelectGenre[j]); //장르 검색용 변수

                            //영화 장르의 아이디 번호를 영화데이터 배열에서 장르명으로 변환;
                            //for구문 안의 for구문으로 장르 순회

                            if (includesOrNot) {
                                $(".movie-result").append(
                                    `<li class="movie-card">
                                    <div class="movie-poster">
                                    <p class="movie-rating">${movieRate}</p>
                                    <div class="movie-poster-img">
                                    ${moviePoster ? `<img src="https://image.tmdb.org/t/p/original/${moviePoster}" class="poster-img" alt="${movieTitle}"/>` : null}
                                    </div>
                                    </div>
                                    <p class="movie-title">${movieTitle}</p>
                                    <p class="movie-date">${movieDate}</p>
                                    <p class="movie-overview">${movieOverview}</p>
                                    </li>`);
                                break;
                            }

                        }; //두번째 for구문 end
                    }; //첫번째 for구분 end

                });

        } else if (selectedOption == "Celebs") { //인물명으로 검색결과 나열
            //영화 key 수정(가져온 기존 데이터가 부실함...)
            //검색결과 css 스타일링

            fetch(actorKey)
                .then(function (res) {
                    return res.json();
                })
                .then(function (myJson) {
                    var resultLeng = myJson.results.length;
                    $(".search-result").children().remove();

                    for (i = 0; i < resultLeng; i++) {
                        var profile = myJson.results[i].profile_path;
                        var personName = myJson.results[i].name;
                        var personJob = myJson.results[i].known_for_department;
                        var filmoLeng = myJson.results[i].known_for.length;

                        $(".person-result").append(
                            `<li class="person-card">
                        <div class="profile-box">
                        <img src="https://image.tmdb.org/t/p/original/${profile}" alt="${personName}"/>
                        </div>
                        <div class="info-box">
                        <div class="person-info">
                        <p class="person-name">${personName}</p>
                        <p class="person-job">${personJob}</p>
                        </div>
                        <ul class="filmo-box">
                        <ul>
                        </div>
                        </li>`
                        )

                        for (j = 0; j < filmoLeng; j++) {
                            var mediaType = myJson.results[i].known_for[j].media_type;
                            var filmoPoster = myJson.results[i].known_for[j].poster_path;
                            var filmoTitle
                            var filmoYear
                            if (mediaType == "tv") {
                                filmoTitle = myJson.results[i].known_for[j].name;
                                filmoYear = myJson.results[i].known_for[j].first_air_date.substring(0, 4);
                            } else if (mediaType == "movie") {
                                filmoTitle = myJson.results[i].known_for[j].title;
                                filmoYear = myJson.results[i].known_for[j].release_date.substring(0, 4);
                            }
                            $(".filmo-box").append(
                                `<li>
                                <p class="media-type">${mediaType}</p> 
                                <div class="filmo-poster">
                                <img src="https://image.tmdb.org/t/p/original/${filmoPoster}" alt=""/>
                                </div>
                                <p class="filmo-title">${filmoTitle}</p>
                                <p class="filmo-year">${filmoYear}</p>
                                </li>`
                            )
                        }
                    }
                })
        }
    }); //search end
    //(2)개봉연도애 따라 필터링(year-filter)
    //셀렉트val과 결과값의 연도 계산
    //음수, 10이상시 영화 카드 hide;
    $(".year-filter>select").on("change", function () {
        var YearSelected = $(".year-filter>select>option:selected").val();
        var resultLeng = $(".movie-card").length;
        for (i = 0; i < resultLeng; i++) {
            var movieYear = $(".movie-card").eq(i).find(".movie-date").text().substring(0, 4); //결과카드의 연도만 변수로 따기
            movieYear = Number(movieYear); //숫자화
            YearSelected = Number(YearSelected); //숫자화
            var yearRange = movieYear - YearSelected; //0~9
            if (yearRange >= 0 && yearRange <= 9) {
                $(".movie-card").eq(i).show();
            } else {
                $(".movie-card").eq(i).hide();
            }
        };
    });

    //(3)sort by 필터링
    $(".sort-by>select").on("change", function () {
        var sortSelected = $(".sort-by>select>option:selected").val();
        var resultLeng = $(".movie-card").length;
        for (i = 0; i < resultLeng; i++) {
            //카드별 개봉일 따와서 data 부여
            var movieDate = $(".movie-card").eq(i).find(".movie-date").text().replace(/\-/g, "");
            movieDate = Number(movieDate);
            $(".movie-card").eq(i).attr("data-year", movieDate);

            //카드별 평점 따와서 data 부여
            var movieRate = $(".movie-card").eq(i).find(".movie-rating").text();
            movieRate = Number(movieRate);
            $(".movie-card").eq(i).attr("data-rate", movieRate);
        };
        if (sortSelected == "Latest") {
            //최근순 영화 배치
            $(".movie-result").html(
                $(".movie-card").sort(function (a, b) {
                    return $(b).attr("data-year") - $(a).attr("data-year");
                })
            )
        } else if (sortSelected == "Oldest") {
            //오래된순 영화 배치
            $(".movie-result").html(
                $(".movie-card").sort(function (a, b) {
                    return $(a).attr("data-year") - $(b).attr("data-year");
                })
            )
        } else {
            $(".movie-result").html(
                //평점순 영화 배치
                $(".movie-card").sort(function (a, b) {
                    return $(b).attr("data-rate") - $(a).attr("data-rate");
                })
            )
        }
    });
}); ///////////////end////////////////