
function SelectRow(ticket) {
    $('#tblTicketList > tbody  > tr').each(function () {
        $(this).css({
            "background-color": ""
        });
    });

    var tr = $("#aTagDetail_" + ticket).parent().parent();

    tr.css("background-color", "#E3F6CE");
}

function ShowTicketDetail(ticket) {

    SelectRow(ticket);

    $("#divTicketDetail").html('');

    Loading();
    $.ajax({
        type: "GET",
        url: "/Ticket/GetDetailByTicketId",
        data: {
            "ticketId": ticket
        },
        success: function (ajaxCallBack) {
            $("#divTicketDetail").html(ajaxCallBack);
            $("#divLoading").hide();
        },
        error: function () {
            alert("Detay Listelenirken bir hata oluştu");
            $("#divLoading").hide();
        }
    });
}

$(".showTicketDetail")
    .click(function () {
        ShowTicketDetail($(this).attr("data"));
    });

$(document)
    .ready(function () {
        //doc ready begin

        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
        });

        readTableHeadersValuesFromLocalStorage();

        $(".btnTableOrganizer").change(function () {

            var column = "#tblTicketList ." + $(this).attr("name");
            var index = $("#tblTicketList thead th").index($(column));
            index++;

            if ($(this).prop("checked") == true) {
                $(column).show();
                $("#tblTicketList tbody tr td:nth-child(" + index + ")").show();
            }
            else if ($(this).prop("checked") == false) {
                $(column).hide();
                $("#tblTicketList tbody tr td:nth-child(" + index + ")").hide();
            }

            var str = $("#frmTableHeaders input[type='checkbox']").map(function () { return this.name + "=" + this.checked; }).get().join("&");

            var requestReportType = $("#requestReportType").val();
            localStorage.setItem("frmTableHeadersValues_" + requestReportType, str);
        });

        var IsRefresh = localStorage.getItem("IsRefresh");
        if (IsRefresh != null) {
            SelectRow(IsRefresh);
        }

        localStorage.removeItem("IsRefresh");

        $('#ticketDetail')
            .on('hidden.bs.modal',
                function () {

                    var IsRefresh = localStorage.getItem("IsRefresh");

                    if (IsRefresh != null) {
                        Loading();
                        location.reload();
                    }
                });

        setFilterTextInputRule();

        function setFilterTextInputRule() {
            var filterTextInput = $("#filterTypeText");
            var filterType = $("#filterType").val();
            if (filterType != "0") {
                filterTextInput.prop("required", true);
            }
            else {
                filterTextInput.prop("required", false);
            }
        };

        $("#filterType")
            .change(function () {

                var filterTextInput = $("#filterTypeText");

                if ($(this).val() != "0") {
                    filterTextInput.prop("required", true);
                }
                else {
                    filterTextInput.prop("required", false);
                }

                if ($(this).val() === "5") {

                    filterTextInput.mask("0000000000");
                    filterTextInput.focus();
                    filterTextInput.attr("placeholder", "Telefon Numarasını 10 hane giriniz.");


                    filterTextInput
                        .bind("keyup blur",
                            function () {
                                for (var firstNumber = $(this);
                                    "0" === firstNumber.val().charAt(0);
                                ) firstNumber.val(firstNumber.val().substr(1));
                            });
                }
                else if ($(this).val() === "1") {
                    filterTextInput.mask("0000000000");
                    filterTextInput.focus();
                    filterTextInput.attr("placeholder", "Ticket Numarasını giriniz.");
                }
                else if ($(this).val() === "2") {
                    filterTextInput.mask("0000000000");
                    filterTextInput.focus();
                    filterTextInput.attr("placeholder", "Müşteri Numarasını giriniz.");
                }
                else if ($(this).val() === "3") {
                    filterTextInput.mask("0000000000");
                    filterTextInput.focus();
                    filterTextInput.attr("placeholder", "Hizmet Numarasını giriniz.");
                }
                else if ($(this).val() === "8") {
                    filterTextInput.mask("0000000000");
                    filterTextInput.focus();
                    filterTextInput.attr("placeholder", "BTK Şikayet Numarasını giriniz.");
                }
                else {
                    filterTextInput.unmask("0000000000");
                    filterTextInput.attr("placeholder", "Seçilen Parametreyi Giriniz");
                }
            });
        
        var sessionStatus = getQueryVariable("sessionStatus");
        var grupId = getQueryVariable("Group");

        if (grupId == 47 || grupId == 48 || grupId == 40 || grupId == 305) {

            $("#divShowOnlineState").show();

            if (sessionStatus === "on") {
                $("#sessionStatus").prop('checked', true);
            } else {
                $("#sessionStatus").prop('checked', false);
            }
        }
        
        // paging loading begin
        $(function () {
            var selector = '#divTicketList';
            var $result = $(selector);


            $result.on('click', ".pagedList a", function (e) {
                var url = $(this).attr('href');

                loadResult(url, selector, $result);

                e.preventDefault();
                return false;
            });

            function loadResult(url, selector, targetEl) {
                $('#divLoading').show();

                targetEl.load(url + ' ' + selector, function () {
                    $('#divLoading').hide();
                    history.pushState(undefined, undefined, url);

                });
            }
        });
        // paging loading end

        // sorting table begin
        var table = $('#tblTicketList')
            .DataTable({
                buttons: ['excel'],
                "pagingType": "numbers",
                "drawCallback": function (settings) {
                    showHideTableColumns();
                }
            });

        table.buttons().container().first()
            .insertAfter('#tblTicketList_length');

        $('.dataTables_length').addClass('bs-select');
        // sorting table end

        var viewModel;

        // date time Picker begin

        $('#dateRangePickerBasTar')
            .datepicker({
                format: 'dd.mm.yyyy'
            });

        $('#dateRangePickerBitTar')
            .datepicker({
                format: 'dd.mm.yyyy'
            });

        // date time Picker end

        function setTicketGroupType(ticketGroupTypeId, selectedItem) {

          
            if (ticketGroupTypeId != null) {

                ClearInputsHandleChanged("group"); 

                viewModel = null;

                Loading();
                $.ajax({
                    type: "GET",
                    url: "/Ticket/GetTicketReportedProblemType",
                    data: {
                        "ticketProcessGroupId": ticketGroupTypeId
                    },
                    success: function (ajaxCallBack) {
                        viewModel = JSON.parse(ajaxCallBack);
                        $.each(viewModel,
                            function (i, item) {
                                $("<option></option>")
                                    .val(item.Id)
                                    .text(item.Description)
                                    .appendTo("#UserProblemType");
                                $("#divLoading").hide();
                            });
                        if (selectedItem != null) {
                            $("#UserProblemType option[value='" + selectedItem + "']").prop('selected', true);
                        }
                        $("#divLoading").hide();
                    },
                    error: function () {
                        $("#divLoading").hide();
                    }
                });
            }
        }

        $("#Group")
            .change(function () {

                var groupId = $(this).val();
                if (groupId == 40 || groupId == 47 || groupId == 48 || groupId == 305) {
                    $("#divShowOnlineState").show();

                } else {
                    $("#divShowOnlineState").hide();

                    $("#sessionStatus").prop('checked', false);
                }

                setTicketGroupType(groupId, null);

                SetTransmissionType(groupId);
            });

        function setReportedProblemType(reportedProblemId, selectedItem) {

           
         
            if (reportedProblemId != null) {

                ClearInputsHandleChanged("userProblemType"); 

                var ticketProcessGroupId = $("#Group").val();

                viewModel = null;

                Loading();

                $.ajax({
                    type: "GET",
                    url: "/Ticket/GetTicketFoundProblem",
                    data: {
                        "reportedProblemId": reportedProblemId,
                        "ticketProcessGroupId": ticketProcessGroupId
                    },
                    success: function (ajaxCallBack) {
                        viewModel = JSON.parse(ajaxCallBack);
                        $.each(viewModel,
                            function (i, item) {
                                $("<option></option>")
                                    .val(item.Id)
                                    .text(item.Description)
                                    .appendTo("#ProblemType");
                                $("#divLoading").hide();
                            });
                        if (selectedItem != null) {
                            $("#ProblemType option[value='" + selectedItem + "']").prop('selected', true);
                        }
                        $("#divLoading").hide();
                    },
                    error: function () {
                        $("#divLoading").hide();
                    }
                });
            }
        }

        $("#UserProblemType")
            .change(function () {
                setReportedProblemType($(this).val(), null);
            });

        function setSubDropDownList(foundProblemId, groupId, selectedSubProblem, selectedSolutionCode, selectedStep) {

         

            if (foundProblemId != null) {

                ClearInputsHandleChanged("problemType"); 

                viewModel = null;

                Loading();

                $.ajax({
                    type: "GET",
                    url: "/Ticket/GetSubListByFoundProblemItem",
                    data: {
                        "foundProblemId": foundProblemId,
                        "groupId": groupId
                    },
                    success: function (ajaxCallBack) {
                        viewModel = JSON.parse(ajaxCallBack);

                        if (viewModel.SubProblemList.length > 0 ||
                            viewModel.SolutionCodeList.length > 0 ||
                            viewModel.StepList.length > 0) {


                            $.each(viewModel.SubProblemList,
                                function (i, item) {
                                    $("<option></option>")
                                        .val(item.Id)
                                        .text(item.Description)
                                        .appendTo("#TicketSubProblemTypeId");
                                });

                            if (selectedSubProblem != null) {
                                $("#TicketSubProblemTypeId option[value='" + selectedSubProblem + "']").prop('selected', true);
                            }

                            $.each(viewModel.SolutionCodeList,
                                function (i, item) {
                                    $("<option></option>")
                                        .val(item.Id)
                                        .text(item.Description)
                                        .appendTo("#TicketSolutionCodeId");
                                });

                            if (selectedSolutionCode != null) {
                                $("#TicketSolutionCodeId option[value='" + selectedSolutionCode + "']").prop('selected', true);
                            }

                            if (viewModel.StepList.length > 0) {

                                $("#trTicketStep").removeClass("hide");

                                $.each(viewModel.StepList,
                                    function (i, item) {
                                        $("<option></option>")
                                            .val(item.Id)
                                            .text(item.Description)
                                            .appendTo("#TicketStep");
                                    });
                            }
                            else {
                                $("#trTicketStep").addClass("hide");
                            }


                            if (selectedStep != null) {
                                $("#TicketStep option[value='" + selectedStep + "']").prop('selected', true);
                            }

                            $("#divLoading").hide();

                        } else {

                            $("#trTicketStep").addClass("hide");

                            $("#divLoading").hide();
                        }
                    },
                    error: function () {
                        $("#divLoading").hide();
                    }
                });
            }
        }

        $("#ProblemType")
            .change(function () {
                setSubDropDownList($(this).val(), $("#Group").val(), null, null, null);
            });

    });

$("#selectedCustomer")
    .change(function () {

        var selectedCust = $(this).val();
        var d = new Date(Date.now());
        if (selectedCust == 0) {
            d.setMonth(d.getMonth() - 2);
            $("#dateRangePickerBasTar").datepicker('setDate', d);
            $("#selectedService").val("0");
        }
        else {
            d.setFullYear(d.getFullYear() - 2);
            $("#dateRangePickerBasTar").datepicker('setDate', d);
        }
    });

function ClearInputsHandleChanged(type) {

    switch (type) {

        case "group":
            $("#UserProblemType").text('');
            $("<option></option>").val('').text('İletilen Sorun Seçiniz...').appendTo("#UserProblemType");

            $("#ProblemType").text('');
            $("<option></option>").val('').text('Bulunan Sorun Seçiniz...').appendTo("#ProblemType");
            break;
        case "userProblemType":
            $("#ProblemType").text('');
            $("<option></option>").val('').text('Bulunan Sorun Seçiniz...').appendTo("#ProblemType");
            break;    
        default:
            break;
    }

    ClearInputsSubList();

}

function ClearInputsSubList() {

    $("#TicketSubProblemTypeId").text('');
    $("<option></option>").val('').text('Alt Sorun Seçiniz...').appendTo("#TicketSubProblemTypeId");

    $("#TicketSolutionCodeId").text('');
    $("<option></option>").val('').text('Çözüm Kodu Seçiniz...').appendTo("#TicketSolutionCodeId");

    $("#TicketStep").text('');
    $("<option></option>").val('').text('Adım Seçiniz...').appendTo("#TicketStep");

    $("#trTicketStep").addClass("hide");

}

function SetTransmissionType(groupId) {
    
    if (groupId === "330") {
        $("#transmissionType").val("3"); // groupId : 330 > *FİBER  // transmissionTye : 3 > fiber
    }
    else {
        $("#transmissionType").val("0");
    }

}


function readTableHeadersValuesFromLocalStorage() {

    var requestReportType = $("#requestReportType").val();
    var formData = localStorage.getItem('frmTableHeadersValues_' + requestReportType);
    if (formData != null) {

        _array = formData.split('&');

        $.each(_array, function (k, v) {

            var field = v.split('=');
            $('#frmTableHeaders [name="' + field[0] + '"]').prop("checked", field[1] === "true");
        });


    }
    else {
        $('#frmTableHeaders').find('input[type="checkbox"]').each(function () {
            $(this).prop("checked", true);
        });
    }
}

function showHideTableColumns() {
    
    $("#tblTicketList tbody tr td").show();

    $("#frmTableHeaders input[type='checkbox']").each(function () {

        var column = "#tblTicketList ." + $(this).attr("name");
        var index = $("#tblTicketList thead th").index($(column));
        index++;

        if ($(this).prop("checked") == true) {
            $(column).show();
            $("#tblTicketList tbody tr td:nth-child(" + index + ")").show();
        }
        else if ($(this).prop("checked") == false) {
            $(column).hide();
            $("#tblTicketList tbody tr td:nth-child(" + index + ")").hide();
        }
    })
}