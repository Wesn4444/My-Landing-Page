'use strict';

(function(){
	function changeAjaxCall(dataObj) {
		$.ajax({
			type: 'get',
			url: dataObj.url,
			data: dataObj,
			success:function(response){
				if(dataObj.changeAddressAjax) {
					alert(dataObj.successMsg);
					window.location.href=dataObj.redirect; 
				}else {
					window.location.href=response.redirectUrl;
				}
			}
		});
	}

	function setDefaultCurrency($selectedCurrency) {
		var $currencySelector = $('.esw-country-selector.selectCurrency .select-field');
		var $currencySelectorDropDown = $('.esw-country-selector.selectCurrency .select-field .current-country');
		var $selectedCountry = $('#selected-country');
		var selectedCountry = $selectedCountry.attr('data-value');
		var urlGetDefaultCurrency = $selectedCountry.attr('data-url');

		$.ajax({
			type: 'get',
			url: urlGetDefaultCurrency,
			data: {
				'country' : selectedCountry
			},
			success: function (response) {
				if (response.success) {
					// Setting the default mapped currency
					$selectedCurrency.html(response.currency);
					$selectedCurrency.attr('data-value', response.currency);

					// Check if country is esw allowed country
					if (response.isAllowed) {
						// Yes, Enable Currency Selectors
						$currencySelector.removeClass('disabled');
						$currencySelectorDropDown.removeClass('disabled');
					} else {
						// No, Disable Currency Selectors
						$currencySelector.addClass('disabled');
						$currencySelectorDropDown.addClass('disabled');
					}
				}
			}
		});
	}

	var header = $('header');
	var footer = $('footer');
	var headerZindex = parseInt(header.css('z-index'));
	var CountrySwitcherModal = null;
	var CountrySwitcherModalBg = null;

	// Returns true if the modal must be retrieved via ajax (ajax function parameters will not be called); false if it is instantly displayed
	function openEswCountrySwitcher(dataObj, ajaxFunctionStart, ajaxFunctionEnd){

		// Local function to show the welcome mat
		function openLocal() {
			CountrySwitcherModal.show();
			CountrySwitcherModalBg.show();
		}

		//  Check if the welcome mat already exists
		if (CountrySwitcherModal && CountrySwitcherModal.length &&
			CountrySwitcherModalBg && CountrySwitcherModalBg.length)
		{
			openLocal();
			return false;
		} else {
			$.ajax({
				type: 'get',
				url: dataObj.eswLandingPageUrl,
				data: dataObj,
				beforeSend: ajaxFunctionStart,
				success: function(response){
					header.prepend(response);
					CountrySwitcherModal = $('.eswModal');
					CountrySwitcherModalBg = $('.modalBg');
					openLocal();

					var $selectedCurrency = $('#selected-currency');
					if ($selectedCurrency.length > 0) {
						setDefaultCurrency($selectedCurrency);
					}
				},
				complete: ajaxFunctionEnd
			});
			return true;
		}
	}

	function closeEswCountrySwitcher() {
		if (CountrySwitcherModal) {
			CountrySwitcherModal.hide();
		}
		if (CountrySwitcherModalBg) {
			CountrySwitcherModalBg.hide();
		}
	}

	function updateCountryList () {	
		$(document).on('click','.btnCheckout', function(e) {
			e.preventDefault();
			$('.btnCheckout').addClass("disabled");
			$.ajax({
				type : 'get',
				url : $(this).attr('data-url'),
				data: '',
				success : function (response) {
					window.open(response.redirectURL,'_self');
				}
			});
		});

		$(document).on('click','.closeLandingPage', function() {
			closeEswCountrySwitcher();
		});

		// set currency first before reload
		$('body').on('click','.esw-country-selector .selector a.landing-link', function (e) {
			e.preventDefault();
			var element = $(this).parents('.select-field');
			var span = $(element).find('span');
			span.attr('data-value', $(this).attr('data-param'));
			span.attr('data-href', $(this).attr('href'));
			span.attr('data-redirect', $(this).attr('data-redirect'));
			span.text($(this).text());
			$(element).find('.current-country .flag-icon').attr('class','flag-icon flag-icon-'+$(this).attr('data-param').toLowerCase());
			$('.selector-active').removeClass('selector-active');
			$(this).parents('.active').removeClass('active');
		});

		// This function selects default currency based on the selected country.
		$('body').on('click', '.esw-country-selector .selector .country.landing-link', function(e){
			e.preventDefault();
			var $selectedCurrency = $('#selected-currency');

			if ($selectedCurrency.length > 0) {
				setDefaultCurrency($selectedCurrency);
			}
		});
		
		// This function selects default currency based on the selected country.
		$('body').on('click', '.esw-country-selector .selector .country.landing-link', function(e){
			e.preventDefault();
			var $selectedCurrency = $('#selected-currency');
			var $selectedCountry = $('#selected-country');
			var selectedCountry = $selectedCountry.attr('data-value');

			var dataUrl = $selectedCountry.attr('data-url');

			if ($selectedCurrency.length > 0) {
				$.ajax({
					type: 'get',
					url: dataUrl,
					data: {
						'country' : selectedCountry
					},
					success: function (response) {
						if (response.success) {
							$selectedCurrency.html(response.currency);
							$selectedCurrency.attr('data-value', response.currency);
						}
					}
				});
			}
		});
		
		$(document).on('click','.esw-btn',function(){
			var $selectedCountry = $('#selected-country');
			var href = $selectedCountry.attr('data-href');
			if (!href || href == "") {
				closeEswCountrySwitcher();
				return;	
			}

			var redirect = $selectedCountry.attr('data-redirect');
			var country = $selectedCountry.attr('data-value');
			var	currency = $("#selected-currency").attr('data-value');
			var	language = $("#selected-locale").attr('data-value');    	
			
			if (country){
				if(!currency){
					currency = $("#selected-country").closest('.select-field').find('.country a:first').attr('data-currency');
				}
				if(!language){
					language = $("#selected-country").closest('.select-field').find('.country a:first').attr('data-locale');
				}
			}else if (language){
				if(!currency){
					currency = $("#selected-locale").closest('.select-field').find('.country a:first').attr('data-currency');
				}
				if(!country){
					country = $("#selected-locale").closest('.select-field').find('.country a:first').attr('data-country');
				}
			}else if (currency){
				if(!country){
					country = $("#selected-currency").closest('.select-field').find('.country a:first').attr('data-currency');
				}
				if(!language){
					language = $("#selected-currency").closest('.select-field').find('.country a:first').attr('data-locale');
				}
			}

			if (redirect && redirect != "") {
				$.ajax({
					type: 'get',
					url: href,
					success : function(response){
						if (response[redirect]) {
							window.location.href = response[redirect];
						} else if (response['redirectUrl']) {
							// ERROR!!!
							window.location.href = response.redirectUrl;
						} else {
							// ERROR!!!
						}
					}
				});
			} else {
				window.location.href = href;
			}
		});

		function openEswCountrySwitcherClick(e) {
			var $this = $(this);
			if (openEswCountrySwitcher({
						'eswLandingPageUrl': $this.closest('.selector-container.footerDropdown').attr('data-url'),
						'dropDownSelection': 'true' 
					},
					function() {
						$this.off('click', openEswCountrySwitcherClick);
						$this.addClass('loading');
					},
					function() {
						$this.removeClass('loading');
						$this.click();
						$this.on('click', openEswCountrySwitcherClick);
						footer.css('z-index', headerZindex - 1);
					}))
			{
				// The modal is being retrieved via ajax
				e.preventDefault();
				return false;
			}
		}

		// This css selector will need to be modified if we ever display the header version
		// of the country selector, as this css selector targets only the footer version
		$('.headerDropdown, .footerDropdown .openEswCountrySelector').on('click', openEswCountrySwitcherClick);

		// Some country select urls refer to link that should be retrieved via ajax
		$('.headerDropdown a[data-redirect], .footerDropdown a[data-redirect]').click(function(e){
			e.preventDefault();
			var redirect = $(this).data('redirect');

			$.ajax({
				type : 'get',
				url : $(this).attr('href'),
				success : function (response) {
					if (response[redirect]) {
						window.location = response[redirect];
					} else {
						// ERROR!!!
					}
				},
				error : function() {
					// ERROR!!!
				}
			});

			return false;
		});

		$(document).on('click','.selected-link', function () {
			var dataObj = {
			'country': $(this).attr('data-country'),
			'currency': $(this).attr('data-currency'),
			'language': $(this).attr('data-locale'),
			'url': $(this).attr('data-url'),
			'action': $('.page').data('action'),
			'queryString': $('.page').data('querystring')
			};
			changeAjaxCall(dataObj);
		});

		$(document).on('change','#shippingCountrydefault',function(){
			var selectedData = {'country' : $('#shippingCountrydefault').val().toUpperCase(),
								'url'	:   $('#shippingCountrydefault').attr('data-url')
							};
			$.ajax({
				type: 'get',
				url: selectedData.url,
				data: selectedData,
				success:function(response){
					if(response.success == false){
						return;
					} else {
						var dataObj = {
								'country': response.country,
								'currency': response.currency,
								'language': response.language,
								'url'		: response.url,
								'action': $('.page').data('action'),
								'queryString': $('.page').data('querystring'),
								'redirect'	: response.redirect,
								'successMsg' : response.successMsg,
								'changeAddressAjax' : true
								};
						changeAjaxCall(dataObj);
					} 
				}
			});
		});
		$('body').on('click','.esw-country-selector .current-country', function (e){
			e.stopPropagation();
			var siblingSelector = $(this).siblings('.selector');
			siblingSelector.toggleClass('active');        
			$(this).toggleClass('selector-active');
			$('.esw-country-selector .selector').not(siblingSelector).removeClass('active');
			$('.esw-country-selector .current-country').not(this).removeClass('selector-active');
		});
		
		$(document).on('click',function(e){
			$('.esw-country-selector .selector').removeClass('active');
			$('.esw-country-selector .current-country').removeClass('selector-active');
		});
		$('body').on('product:afterAttributeSelect', function (e, response) {
			if (response.data.product.isProductRestricted) {
				$('.modal.show').find('button.update-cart-product-global').addClass('d-none');
				$('.modal.show').find('.price').addClass('d-none');
				$('.modal.show').find('.product-not-available-msg').removeClass('d-none');
			} else {
				$('.modal.show').find('button.update-cart-product-global').removeClass('d-none');
				$('.modal.show').find('.price').removeClass('d-none');
				$('.modal.show').find('.product-not-available-msg').addClass('d-none');
			}
		});

		// Position the footer modal intelligently within the boundaries of the window
		$('body').on('click','.openNonEswCountrySelector', function (e){

			// Move the footer in front of the header
			footer.css('z-index', headerZindex + 1);

			var modal = $('.footerDropdown .nonEswCountrySelector');

			// Reset any previous position
			modal.css({
				'bottom': '100%',
				'height': 'auto'
			});

			var css = {};
			var padding = 5; // top and bottom spacing for the modal
			var offset = modal.offset().top - $(window).scrollTop();
			var bottom = 0;
			if (offset < padding) {
				bottom += (-1 * offset) + padding;
			}

			var height = modal.height();
			var windowHeight = $(window).height();
			if (height + (2 * padding) > windowHeight) {
				bottom -= (height + (4 * padding)) - windowHeight;
				css['height'] = (windowHeight - (2 * padding)) + 'px';
			}

			if (bottom) {
				css['bottom'] = 'calc(100% - ' + Math.ceil(bottom) + 'px)';
			}
			modal.css(css);
		});
	};

	$('body').on('click','.nonEswCountrySelectorMask', function (e){
		var checked = document.getElementById($(this).attr('for')).checked;
		var z = checked ? -1 : +1;
		footer.css('z-index', headerZindex + z);
	});

	// hide footer elements based on country
	function hideFooterElements(){
		var isEwsEnabled = $('#eswmeta').data('eswenabled');
		if(isEwsEnabled) {
			var country = $('#eswmeta').data('country');
			$('[data-nscountries*=' + country + ']').hide();
		}
	}

	$(document).ready(function(){
		updateCountryList();

		hideFooterElements();

		// Check if the welcome mat should be automatically displayed
		var footerDropdown = $('.footerDropdown');
		var geocountry = footerDropdown.data('geocountry');
		if (geocountry) {
			// This will need to be modified if we ever display the header selector, as it targets only the footer selector
			var eswLandingPageUrl = footerDropdown.data('url'); 
			var dataObj = {
				'eswLandingPageUrl': eswLandingPageUrl,
				'dropDownSelection': 'true' 
			}
			openEswCountrySwitcher(dataObj); 
		}
	});
})();