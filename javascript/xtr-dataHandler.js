	/**
	 * Classe, para manipular e obter compositeData a partir dos dados fornecidos pelo servidor
	 *
	 * @method  DataHandler
	 *
	 * @param  {object}  data  {titulo: string, coluna:Object[], grafico:Object[] }
	 */
	function DataHandler(data){
		///////////////////////////
		//VARIAVEIS DE INSTANCIA //
		///////////////////////////
			var titulo;
			var colunas;
			var graficos;
			var Data;

			var compositeDatas;
			var currentCompositeData;
			var currentIndex = 0;

			var primeiro;
			var ordem;

			var maximo = 30;

			var digestEnable = false;
			var digestCycle = 0;
		///////////////
		//CONSTRUÇÃO //
		///////////////
			if(!XtrGraficoUtil.isset(data)){
				console.error("dataHandler, input data is not set");
				return;
			}
			if(!XtrGraficoUtil.isobj(data)){
				console.error("dataHandler, input data is not a object");
				return;
			}
			if(!XtrGraficoUtil.isset(data.coluna)){
				console.error("dataHandler, input data\\coluna is not set");
				return;
			}
			if(!XtrGraficoUtil.isarray(data.coluna)){
				console.error("dataHandler, input data\\coluna is not a array");
				return;
			}
			if(data.coluna.length < 2 ){
				console.error("dataHandler, input data\\coluna is not long enough, must have 2 itens");
				return;
			}
			if(!XtrGraficoUtil.isset(data.grafico)){
				console.warn("dataHandler, input data\\grafico is not set");
			}
			else if(!XtrGraficoUtil.isarray(data.grafico)){
				console.error("dataHandler, input data\\grafico is not a array");
				return;
			}
			if(XtrGraficoUtil.isset(data.titulo)){
				titulo = data.titulo;
			}
			else{
				titulo = "Novo grafico";
				console.warn("dataHandler, input data\\titulo is not set");
			}
			digestEnable = true;
			digest();

			xtrGrafico.organize.first = data.sortedColumn || xtrGrafico.organize.first;
			if(xtrGrafico.organize.first == null){
				xtrGrafico.organize.first = 1;
			}

			xtrGrafico.organize.order = data.sortedOrder || xtrGrafico.organize.order;

            compositeDatas.sort(function(a,b){
                return XtrGraficoUtil.compare(b,a,"series.length");
            });


			if(xtrGrafico.organize.first > 0){
				coluna = data.coluna[xtrGrafico.organize.first];

				for(var compositeDataIndex = 0; compositeDatas.length > compositeDataIndex; compositeDataIndex++){
					var compositeData = compositeDatas[compositeDataIndex];
					var serie = compositeData.series;
					if(serie.length > 1)
						continue;					
					serie = serie[0];
					if(serie.titulo.indexOf(coluna.titulo) == 0)
						break;
				}
				xtrGrafico.organize.first = compositeDataIndex;
				isASC = xtrGrafico.organize.order.indexOf("asc") >= 0;

				compositeDatas[compositeDataIndex].notOrder = true;

				sort(compositeDataIndex, isASC);
			}

			this.saveRawData=saveRawData;
			this.setMaximum=setMaximum;
			this.next=next;
			this.current=current;
			this.previous=previous;
			this.moveTo=moveTo;
			this.load=load;
			this.getSeeker=getSeeker;
			this.search=search;

			return this;

			function dosomething(){
				return;
			}
		/////////////////////
		//METODOS PROPRIOS //
		/////////////////////
			function sort(compositeDataIndex,asc){
				var compositeData;

				var serie;

				var dados,dadosFormatados;
				var rotulos,rotulosFormatados;

				var order,orderClone;
				var ord;

				asc = XtrGraficoUtil.isset(asc) ? asc : true;
				order = [];

				compositeData = compositeDatas[compositeDataIndex];

				serie = compositeData.series;
				serie = serie[0];

				dados = serie.dados;
				dadosFormatados = serie.dadosFormatados;
				rotulos = compositeData.rotulos;
				rotulosFormatados = compositeData.rotulosFormatados;

				dados.sort(function(a,b){
					ord = asc ? a - b : b - a;
					order.push(ord);
					return ord;
				});

				orderClone = XtrGraficoUtil.clone(order);
				dadosFormatados.sort(function(a,b){
					return orderClone.shift();
				});

				orderClone = XtrGraficoUtil.clone(order);
				rotulos.sort(function(a,b){
					return orderClone.shift();
				});

				orderClone = XtrGraficoUtil.clone(order);
				rotulosFormatados.sort(function(a,b){
					return orderClone.shift();
				});

			}
			/**
			 * OBTER, series da forma que serão usadas na formação do compositeData
			 *
			 * @method getDataSeries
			 *
			 * @param  {Object[]}      descendentes
			 *
			 * @return {Object[]}
			 */
			function getDataSeries(descendentes){
				var descendente;
				var descendenteIndex;
				var dataSeries,dataSerie;

				dataSeries = [];
				
				for(descendenteIndex = 0; descendentes.length > descendenteIndex; descendenteIndex++){
					descendente = descendentes[descendenteIndex];

					if(XtrGraficoUtil.isset(descendente)){
						dataSerie = {
							titulo: descendente.titulo,
							unidade: descendente.unidade,				
							dados: descendente.dados,
							dadosFormatados: descendente.dadosFormatados,
							mostrar: !XtrGraficoUtil.isset(descendente.mostrar) ? true : descendente.mostrar!=null ? descendente.mostrar : false,
							tipo: descendente.tipo,					
							somaHorizontal: descendente.somaHorizontal,	
							somaVertical: descendente.somaVertical
						}

						dataSeries.push(dataSerie);
					}
				};

				return dataSeries;
			}
			/**
			 * OBTER, compositeData especifico para \principal, \descendentes e \kwargs, sendo esse ultimo possuir
			 * as seguintes propriedades
			 *
			 * @method getSpecificCompositeData
			 *
			 * @param  {Object}                 principal
			 * @param  {Object[]}               descendentes
			 * @param  {Object}                 kwargs
			 *
			 * @return {Object}
			 */
			function getSpecificCompositeData(principal,descendentes,kwargs,tituloPrincipal){
				var compositeData;

				var colunaIndexes;
				var indexSeeker;

				var tipo;
				var tipoDado;
				var escala;
				var titulo;
				
				var mostrar;

				var specifics,specific;
				var descendente;
				var descendenteIndex;

				tipo = XtrGraficoUtil.isset(kwargs.tipo) ? kwargs.tipo : "none";
				colunaIndexes = XtrGraficoUtil.isset(kwargs.colunas) ? kwargs.colunas : "all";
				mostrar = XtrGraficoUtil.isset(kwargs.mostrar) ? kwargs.mostrar : true;
				tipoDado = XtrGraficoUtil.isset(kwargs.tipoDado) ? kwargs.tipoDado : principal.tipo;
				escala = XtrGraficoUtil.isset(kwargs.escala) ? kwargs.escala : "linear";
				titulo = XtrGraficoUtil.isset(kwargs.titulo) ? kwargs.titulo : principal.titulo;
				specifics = [];
				if(colunaIndexes == "all"){
					indexSeeker = descendentes.length;
					while(indexSeeker--){
						descendente = descendentes[indexSeeker];
						specifics.push(descendente);
					}	
				}
				else{
					colunaIndexes = XtrGraficoUtil.isarray(colunaIndexes) ? colunaIndexes : [colunaIndexes];
					indexSeeker = colunaIndexes.length;
					while(indexSeeker--){
						colunaIndex = colunaIndexes[indexSeeker];
						descendente = descendentes[colunaIndex-1];
						if(XtrGraficoUtil.isset(descendente)){
							specifics.push(descendente);
						}
					}					
				}
				if(specifics.length >= 1){					
					compositeData = {
						titulos: {
							identificadores: titulo,
							valores: ""
						},
						tipo: tipo,
						escala: escala,
						series: getDataSeries(specifics),
						rotulosFormatados: principal.dadosFormatados,
						rotulos: principal.dados,
						links: principal.url,		
						dado: tipoDado,
						inconsistencias: [],
						polados: [],
						titulo: tituloPrincipal
					}
				}

				return compositeData;
			}
			/**
			 * OBTER, compositeData referente a uma coluna principal e seus respectivos descendentes.
			 *
			 * @method  getCompositeData
			 *
			 * @param   {Object}          principal
			 * @param   {Object[]}        descendentes
			 *
			 * @return  {Object}          CompositeData para ser usado diretamente em \SuperChart
			 */
			function getCompositeData(principal,descendentes,tituloPrincipal){
				var descendente;
				var descendenteIndex;

				var series,serie;
				var tipoEscala;
				var escala;

				var rotulos;

				var compositeData;

				descendentes = XtrGraficoUtil.isarray(descendentes) ? descendentes : [descendentes];
				
				tipoEscala = getType(principal,descendentes);

				if(tipoEscala[0].indexOf("geografica") >= 0 && descendentes.length > 1)
					tipoEscala[0] = null

				compositeData = {
					titulos: {
						identificadores: principal.titulo,
						valores: ""
					},
					tipo: tipoEscala[0],
					escala: tipoEscala[1],
					series: getDataSeries(descendentes),
					rotulosFormatados: principal.dadosFormatados,
					rotulos: principal.dados,
					links: principal.url,		
					dado: principal.tipo,
					inconsistencias: [],
					polados: [],
					titulo: tituloPrincipal
				}

				return compositeData;
			}
			/**
			 * OBTER, compositeDatas, referente a uma coluna principal.
			 *
			 * @method  getCompositeDatas
			 *
			 * @param   {Object}           principal
			 *
			 * @return  {Object[]}         CompositeDatas cada Object para ser usado em \SuperChart
			 */
			function getCompositeDatas(principal,descendentes,graficos,tituloPrincipal){
				var grupoMaker;

				var grupos,grupo;
				var grupoIndex;

				var innerGrupo;
				var innerGrupoIndex;

				var compositeDatas,compositeData;

				var grafico;
				var graficoIndex;

				var kwargs

				graficos = XtrGraficoUtil.isset(graficos) ? graficos : [];

				grupoMaker = new GroupMaker(descendentes);	

				grupos = grupoMaker.elements;
				
				compositeDatas = [];

				for(grupoIndex in grupos){
					grupo = grupos[grupoIndex];

					compositeData = getCompositeData(principal,grupo,tituloPrincipal);

					if(XtrGraficoUtil.isset(compositeData.tipo) ? compositeData.tipo!=null : false)
						compositeDatas.push(compositeData);
						
					for(innerGrupoIndex = 0; grupo.length > innerGrupoIndex && grupo.length > 1; innerGrupoIndex++){
						innerGrupo = grupo[innerGrupoIndex];
						compositeData = getCompositeData(principal,innerGrupo,tituloPrincipal);
						if(XtrGraficoUtil.isset(compositeData.tipo) ? compositeData.tipo!=null : false)
							compositeDatas.push(compositeData);
					};
				};				
				for(graficoIndex = 0; graficos.length > graficoIndex; graficoIndex++){
					grafico = graficos[graficoIndex];

					kwargs = {
						tipo: grafico.tipo,
						mostrar: grafico.mostrar,
						colunas: grafico.colunas
					};
					compositeData = getSpecificCompositeData(principal,descendentes,kwargs,tituloPrincipal);
					if(XtrGraficoUtil.isobj(compositeData) ? compositeData.tipo!=null : false)
						compositeDatas.push(compositeData);
				};

				kwargs = {
					tipo: "tabela",
					mostrar: "false",
					colunas: "all"
				}
				compositeData = getSpecificCompositeData(principal,descendentes,kwargs,tituloPrincipal)

				compositeDatas.push(compositeData);

				return compositeDatas;
			}		
			/**
			 * OBTER, tipo de grafico referente à coluna principal e seus respectivos descendentes
			 *
			 * @method  getType
			 *
			 * @param   {ColunaPrincipal}  Principal
			 * @param   {ColunaDescendentes}  Descendentes
			 * 
			 * @return  {String}  Nome do tipo de grafico para ser usado na geração do CompositeData em \getCompositedata
			 */
			function getType(Principal,Descendentes){
				var tipos;
				var tipoIndex;
				var tem;
				var grafico,escala;	
				var principal;
				var descendentes;

				principal = new ColunaPrincipal(Principal);
				descendentes = new ColunasDescendentes(Descendentes);

				tipos ={
					principal: ['cronologica','ordinal','nominal','geografica'],
					descendentes: ['absoluto','coeficiente','indice']
				} ;

				tem = {
					absoluto: descendentes.has("absoluto"),
					coeficiente: descendentes.has("coeficiente"),
					indice: descendentes.has("coeficiente"),
					soma:{
						vertical: descendentes.hassum("vertical"),
						horizontal: descendentes.hassum("horizontal") && descendentes.length>1
					},
					positivos: descendentes.hasvalue("min >= 0"),
					uma: {
						serie: descendentes.length == 1,
						categoria: principal._.dados.length == 1
					},
					abaixoDoLimite: descendentes.hasvalue("length <= "+maximo),
					periodosIguais: principal.periodosIguais,
					mesmoEstado: principal.mesmoEstado,
					mesmaRegiao: principal.mesmaRegiao,
					mesmaMesorregiao: principal.mesmaMesorregiao,
					municipios: principal.municipios,
					estados: principal.estados,
					regioes: principal.regioes,
					mesorregioes: principal.mesorregioes,
					microrregioes: principal.microregioes
				}

				dosomething("------------------");
				if(tem.uma.categoria && tem.uma.serie){
					return "";
				}				
				tipo = principal._.tipo;
				tipoIndex = tipos.principal.indexOf(tipo);

				if(tipoIndex==0){ //Cronologica

					dosomething("Dividida em períodos iguais?",tem.periodosIguais);

					if(tem.periodosIguais){			

						dosomething("Coeficientes horizontais e/ou tem Índices?",
									tem.coeficiente && tem.soma.horizontal || tem.indice);	

						if(tem.coeficiente && tem.soma.horizontal || tem.indice){

							dosomething("Quantas séries de dados?",
										descendentes.length);

							if(tem.uma.serie){
								grafico = "line";
								escala = getScale(descendentes);
								dosomething(grafico,escala);
								return [grafico,escala];
							}
							else{
								grafico = "line"; //agrupada
								escala = getScale(descendentes);
								dosomething(grafico,escala);
								return [grafico,escala];
							}
						}
						dosomething("Valores absolutos ou porcentagens verticais?",tem.absoluto || tem.coeficiente,'\n',
									"Valores somam verticalmente?",tem.soma.vertical);

						if((tem.absoluto || tem.coeficiente && tem.soma.vertical)&& tem.soma.vertical){

							dosomething("Quantas séries de dados?",descendentes.length);

							if(tem.uma.serie){
								grafico = "area";
								escala = "linear";
								dosomething(grafico,escala);
								return [grafico,escala];
							}

							dosomething("Valores absolutos?",tem.absoluto,'\n',
								"Valores positivos?",tem.positivos,'\n',
								"Valores somam horizontalmente?",tem.soma.horizontal);

							if(tem.absoluto && tem.positivos && tem.soma.horizontal){
								grafico = "stackedarea";
								escala = "linear";
								dosomething(grafico,escala);
								return [grafico,escala];
							}
						}
					}
					tipoIndex++;
				}
				if(tipoIndex==1){ //Ordinal
					if(tem.abaixoDoLimite){

						dosomething("Quantas séries de dados?",descendentes.length);

						if(tem.uma.serie){
							grafico = "columns";
							escala = "linear";
							dosomething(grafico,escala);
							return [grafico,escala];
						}

						dosomething("Valores positivos?",tem.positivos,'\n',
							"Valores somam horizontalmente?",tem.soma.horizontal);

						if(!(tem.positivos && tem.soma.horizontal)){
							grafico = "clusteredcolumns";
							escala = getScale(descendentes);
							dosomething(grafico,escala);
							return [grafico,escala];
						}

						dosomething("Valores absolutos?",tem.absoluto);

						if(tem.absoluto){
							grafico = "stackedcolumns";
							escala = "linear";
							dosomething(grafico,escala);
							return [grafico,escala];
						}
						dosomething("Porcentagens horizontais?",tem.coeficiente && tem.soma.horizontal);

						if(tem.coeficiente && tem.soma.horizontal){
							grafico = "stackedcolumns";
							escala = "justa";
							dosomething(grafico,escala);
							return [grafico,escala];
						}
						else{
							grafico = "clusteredcolumns";
							escala = getScale(descendentes);
							dosomething(grafico,escala);
							return [grafico,escala];
						}
					}
				}				
				if(tipoIndex==3){ //geografica
					grafico = "geografica";
					escala = "linear";

					if(tem.municipios){
						grafico += "/municipios";
					}
					else if(tem.microrregioes){
						grafico += "/microrregioes";
					}
					else if(tem.mesorregioes){
						grafico += "/mesorregioes";						
					}
					else if(tem.estados){
						grafico += "/estados";
					}
					else if(tem.regioes){
						grafico += "/regioes";
					}

					if(tem.mesmaRegiao){
						if(tem.mesmoEstado){
							grafico += "/estados/"+tem.mesmoEstado.toLowerCase();

							if(tem.mesmaMesorregiao){						
								grafico += "/mesorregioes/"+tem.mesmaMesorregiao.toLowerCase();
							}
						}
						else{
							grafico += "/regioes/"+tem.mesmaRegiao.toLowerCase();
						}
					}
					else{
						grafico += "/brasil"
					}
					
					dosomething(grafico,escala);
					return [grafico,escala];
				}
				else{
					tipoIndex--;
				}
				if(tipoIndex==2){ //nominal
					dosomething("1 série de dados?",tem.uma.serie,'\n',
						"Valores absolutos ou porcentagens verticais?",tem.coeficiente && tem.soma.vertical || tem.absoluto,'\n',
						"Valores positivos?",tem.positivos,'\n',
						"Valores somam verticalmente?",tem.soma.vertical);
					if(tem.uma.serie && (tem.coeficiente && tem.soma.vertical || tem.absoluto) && tem.positivos && tem.soma.vertical){
						grafico = "pie";
						escala = "linear";
						dosomething(grafico,escala);
						return [grafico,escala];
					}
				}

				dosomething("Quantas séries de dados?",descendentes.length);

				if(tem.maisDeUma){
					grafico = "bars";
					escala = "linear";
					dosomething(grafico,escala);
					return [grafico,escala];
				}

				dosomething("Valores positivos? Valores somam horizontalmente?",
							tem.positivos,'e',tem.soma.horizontal);

				if(tem.positivos && tem.soma.horizontal){

					dosomething("Valores absolutos?",tem.absoluto);

					if(tem.absoluto){
						grafico = "stackedbars";
						escala = "linear";
						dosomething(grafico,escala);
						return [grafico,escala];
					}

					dosomething("Porcentagens horizontais?",tem.coeficiente && tem.soma.horizontal);

					if(tem.coeficiente && tem.soma.horizontal){
						grafico = "stackedbars";
						escala = "justa";
						dosomething(grafico,escala);
						return [grafico,escala];
					}
				}
				
				grafico = "clusteredbars";
				escala = getScale(descendentes);
				dosomething(grafico,escala);
				return [grafico,escala];
			}
			/**
			 * OBTER, escala de grafico referente as colunas de descendentes
			 *
			 * @method getScale
			 *
			 * @param  {ColunaDescedentes}  Descendentes
			 *
			 * @return  {String}  Nome da escala de grafico para ser usado na geração do CompositeData
			 */
			function getScale(Descendentes){
				var base10;

				base10 = Descendentes.hasvalue("base10 <= 4");

				if(base10)
					return "linear";
				return "log";
			}

			/**
			 * ATUALIZAR informações, referente à essa classe
			 *
			 * @method  digest
			 *
			 * @param   {Object[]}  data
			 *
			 * @return  {void}
			 */
			function digest(){
				if(digestEnable){
					dosomething("Digest of DataHandler was request by",arguments.callee.caller);

					colunas = {
						principal: {},
						descendentes: []
					}

					Data = XtrGraficoUtil.clone(data);

					digestEnable = false;
					
					colunas.principal = Data.coluna.shift();

					colunas.descendentes = Data.coluna;

					graficos = Data.grafico;

					tituloPrincipal = Data.titulo;

					compositeDatas = getCompositeDatas(
						colunas.principal,
						colunas.descendentes,
						graficos,
						tituloPrincipal
					);

					ordem = Data.column;

					primeiro = Data.sortedColumn;

					compositeDatas.sort(function(a,b){
						
					});
					
					currentIndex = 0;

					digestCycle++;
				}
			}
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
			/**
			 * SAVLAR informações de data.
			 *
			 * @method  saveRawData
			 *
			 * @param   {Object Object}  data
			 *
			 * @return  {void}
			 */
			function saveRawData(data){
				Data = data;
				digestEnable = true;
				digest();
			}
			/**
			 * GRAVAR, maxima quantidade de linhas/categorias.
			 *
			 * @method  setMaximum
			 *
			 * @param   {Integer}    val
			 */
			function setMaximum(val){
				maximo = val;
				digest();
			}
			/**
			 * OBTER o array de compositeData em \compositeDatas
			 *
			 * @method  load
			 *
			 * @return  {Object[]} 
			 */
			function load(){
				return compositeDatas;
			}
			/**
			 * MOVER seeker para o proximo compositeData dos \compositeDatas
			 *
			 * @method  next
			 *
			 * @return  {Object}  compositeData
			 */
			function next(){
				if(compositeDatas.length >= currentIndex){
					currentIndex++;					
				}
				return this;
			}
			/**
			 * OBTER, compositeData referente ao seeker de index atual
			 *
			 * @method  current
			 *
			 * @return  {Object}  compositeData
			 */
			function current(){
				return compositeDatas[currentIndex];
			}
			/**
			 * MOVER seeker para o anterior compositeData dos \compositeDatas
			 *
			 * @method  previous
			 *
			 * @return  {Object}  compositeData
			 */
			function previous(){
				if(currentIndex > 0){
					currentIndex--;
				}
				return this;
			}
			/**
			 * MOVER seeker para o indice enviado por parametro dos \compositeDatas
			 *
			 * @param  {Integer}  val  
			 *
			 * @return  {Object}  compositeData
			 */
			function moveTo(val){
				if(0 <= val && val < compositeDatas.length){
					currentIndex = val;
				}
				return this;
			}
			/**
			 * OBTER posicao do seeker
			 *
			 * @return  {Integer}  currentIndex
			 */
			function getSeeker(){
				return currentIndex;
			}
			/**
			 * OBTER, compositeData referente ao \tipo fornecido
			 *
			 * @method  search
			 *
			 * @param   {String|String[]}  val
			 * @param   {Integer}  pos 
			 *
			 * @return  {Object[]}
			 */
			function search(tipo,pos){
				var compositeData;
				var index;
				var matchs;

				tipo = XtrGraficoUtil.isarray(tipo) ? tipo : [tipo];

				matchs = [];
				for(index = 0; compositeDatas.length > index; index++){
					compositeData = compositeDatas[index];
					if(tipo.indexOf(compositeData.tipo) >= 0){
						matchs.push(compositeData);
					}
				};
				if(XtrGraficoUtil.isset(pos))
					return matchs[pos];

				return matchs;
			}
	}
	/**
	 * Classe, para obter grupos de \Data através da propriedade somaHorizontal.
	 *
	 * @method  GroupMaker
	 *
	 * @param   {Object[]}    descendentes
	 */
	function GroupMaker(descendentes){
		///////////////////////////
		//VARIAVEIS DE INSTANCIA //
		///////////////////////////
			var grupos;
			var semGrupoCount;	
		///////////////
		//CONSTRUÇÃO //
		///////////////
			grupos = {
				indexes: {},
				elements: {}
			};

			semGrupoCount = 0;

			if(XtrGraficoUtil.isarray(descendentes)){

				var descendente;
				var descendenteIndex;

				for(descendenteIndex = 0; descendentes.length > descendenteIndex; descendenteIndex++){
					descendente = descendentes[descendenteIndex];
					push(descendente,descendenteIndex);
				};
			}

			this.push = push;
			this.elements = grupos.elements;
			this.indexes = grupos.indexes;
			return this;
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
			function push(descendente,index){
				var grupo;
				var hasIndex;

				hasIndex = XtrGraficoUtil.isset(index);

				if(XtrGraficoUtil.isset(descendente)){
					if(XtrGraficoUtil.isset(descendente.somaHorizontal) ? descendente.somaHorizontal!=null : false){
						grupo = descendente.somaHorizontal;
					}
					else{
						grupo = semGrupoCount.toString();
						semGrupoCount++;
					}
					
					if(!XtrGraficoUtil.isset(grupos.elements[grupo]) || !XtrGraficoUtil.isset(grupos.indexes[grupo])){
						grupos.elements[grupo] = [];
						if(hasIndex)
							grupos.indexes[grupo] = [];
					}
					grupos.elements[grupo].push(descendente);
					if(hasIndex)
						grupos.indexes[grupo].push(descendente);
				}
			}
	}
	/**
	 * Classe, para obter Date através de input customizado.
	 *
	 * @method  CustomDate
	 *
	 * @param   {Date}    customDateString
	 */
	function CustomDate(customDateString){
		var customDateArray;
		var date;
		var toEval;

		customDateArray = customDateString.split("-");

		date = eval("new Date("+customDateArray.toString()+");");

		return date;
	}
	/**
	 * Classe, para obter certas informações da coluna princial.
	 *
	 * @method  ColunaPrincipal
	 *
	 * @param   {Object}         principal
	 */
	function ColunaPrincipal(principal){
		var municipios;
		var estados;
		var mesorregioes;
		var microregioes;
		var regioes;
		///////////////
		//CONSTRUÇÃO //
		///////////////
			municipios = principal.titulo.toLowerCase().indexOf("município") >= 0;
			estados = principal.titulo.toLowerCase().indexOf("estado") >= 0;
			mesorregioes = principal.titulo.toLowerCase().indexOf("mesorregião") >= 0;
			microregioes = principal.titulo.toLowerCase().indexOf("microrregião") >= 0;
			regioes = principal.titulo.toLowerCase().indexOf("região") >= 0;

			this.periodosIguais = periodosIguais();
			this.municipios = municipios;
			this.estados = estados;
			this.mesorregioes = mesorregioes;
			this.microregioes = microregioes;
			this.regioes = regioes;

			this.mesmoEstado = mesmo("estado");
			this.mesmaRegiao = mesmo("regiao");
			this.mesmaMesorregiao = mesmo("mesorregiao");
			if(this.mesmaMesorregiao){
				this.mesmaMesorregiao = this.mesmaMesorregiao.replace("/","-").replace(/\s/g,"_");
			}
			
			this._ = principal;

			return this;
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
			/**
			 * INDENTIFICAR se coluna principal possui periodos com distancias iguais
			 *
			 * @method  periodosIguais
			 *
			 * @return  {Boolean} 
			 */
			function periodosIguais(){
				var rotulos,rotuloCurrent,rotuloBefore;
				var rotuloIndex;
				var difRotuloSum;
				var difRotulo;

				var hasChange;

				rotulos = principal.dados;

				hasChange = rotulos.length <= 1;
				hasChange = hasChange;

				if(principal.tipo != "cronologica")
					return false;

				for(rotuloIndex = 1; rotulos.length > rotuloIndex && !hasChange; rotuloIndex++){

					rotuloCurrent = rotulos[rotuloIndex];
					rotuloBefore = rotulos[rotuloIndex-1];

					rotuloCurrent = new CustomDate(rotuloCurrent);
					rotuloBefore = new CustomDate(rotuloBefore);

					rotuloCurrent = rotuloCurrent.getFullYear();
					rotuloBefore = rotuloBefore.getFullYear();

					difRotulo = rotuloCurrent - rotuloBefore;
					difRotuloSum += difRotulo;

					hasChange = difRotulo == difRotuloSum/rotuloIndex;
				};

				return hasChange;					
			}

			function mesmo(tocompare){
				var rotulos;				
				var rotuloCurrent,rotuloBefore;
				var rotuloIndex;

				var regiao;
				var regiaoNome;

				var goOn;

				rotulos = principal.dados;

				goOn = rotulos.length > 1;
				goOn = goOn && principal.tipo == "geografica";

				for(rotuloIndex = 1; rotulos.length > rotuloIndex && goOn; rotuloIndex++){					
					rotuloCurrent = rotulos[rotuloIndex];
					rotuloBefore = rotulos[rotuloIndex-1];

					if(municipios){
						goOn = aux(rotuloCurrent,rotuloBefore,"nome",tocompare);
					}
					else if(microregioes){
						goOn = aux(rotuloCurrent,rotuloBefore,"microrregiao",tocompare);
					}
					else if(mesorregioes){
						goOn = aux(rotuloCurrent,rotuloBefore,"mesorregiao",tocompare);
					}
					else if(estados){
						goOn = aux(rotuloCurrent,rotuloBefore,"estado",tocompare);
					}
				};
				return goOn;

				function aux(rotuloCurrent,rotuloBefore,propertyTarget,propertyToCompare){
					var infoCurrent = XTR_MUNICIPIOS_INFO.filter(function(value){
						return value[propertyTarget] == rotuloCurrent;
					});
					var infoBefore = XTR_MUNICIPIOS_INFO.filter(function(value){
						return value[propertyTarget] == rotuloBefore;
					});

					if(infoBefore.length > 0 && infoCurrent.length > 0){

						infoBefore = infoBefore[0];
						infoCurrent = infoCurrent[0];

						infoCurrent = infoCurrent[propertyToCompare];
						infoBefore = infoBefore[propertyToCompare];
						if(infoBefore.replace(/\s/ig,"") == infoCurrent.replace(/\s/ig,"")){
							return infoCurrent;
						}
					}
					return false;
				}
			}
	}
	/**
	 * Classe, para obter certas informações das colunas descendentes.
	 *
	 * @method  ColunasDescendentes
	 *
	 * @param   {Object[]}	descendentes
	 */
	function ColunasDescendentes(descendentes){
		///////////////
		//CONSTRUÇÃO //
		///////////////		
			this.has = has;
			this.hassum = hassum;
			this.hasvalue = hasvalue;
			this.length = descendentes.length;
			this._ = descendentes

			return this;
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
			function has(needle){
				var descendente;
				var descendenteIndex;

				var tipo;

				var mostrar;
				var tem;

				tem = true;

				needle = XtrGraficoUtil.isarray(needle) ? needle : [needle];

				for(descendenteIndex = 0; descendentes.length > descendenteIndex && tem; descendenteIndex++){
					descendente = descendentes[descendenteIndex];
					
					tipo = descendente.tipo;

					tem = needle.indexOf(tipo) >= 0;

				}

				return tem;
			}
			function hassum(needle){
				var descendente;	
				var descendenteIndex;

				var property;
				var soma;
				var tem;

				needle = needle.charAt(0).toUpperCase() + needle.slice(1);

				property = "soma"+needle;

				tem = true;

				for(descendenteIndex = 0; descendentes.length > descendenteIndex && tem; descendenteIndex++){
					descendente = descendentes[descendenteIndex];
					
					soma = descendente[property];
					soma = XtrGraficoUtil.isset(soma) ? soma : false;
					soma = soma==null ? false : soma;
					tem = soma;

				}

				return tem;
			}
			function hasvalue(maxmin,t){
				var descendente;	
				var descendenteIndex;

				var valores,max,min,length,base10,bases10,base10max,base10min;
				var tem;

				tem = true;

				function log(val){
					return Math.log(val) / Math.log(10);
				}			
				bases10 = {
					max: [],
					min: []
				};
				for(descendenteIndex = 0; descendentes.length > descendenteIndex && tem; descendenteIndex++){
					descendente = descendentes[descendenteIndex];
					valores = descendente.dados;

					max = XtrGraficoUtil.maximum(null, valores);
					min =  XtrGraficoUtil.minimum(null, valores);
					base10max = XtrGraficoUtil.log10(max);
					base10min = XtrGraficoUtil.log10(min);

					bases10.max.push(base10max);
					bases10.min.push(base10min);

					base10max = XtrGraficoUtil.maximum(null,bases10.max);
					base10min = XtrGraficoUtil.minimum(null,bases10.min);

					base10 = base10max - base10min;

					length = valores.length;
					
					tem = eval(maxmin);

				}

				return tem;
			}
	}
	function LocationHandler(){

		this.getSearch = getSearch;

		return this;

		function getSearch(property){
			var location;
			var locationIndex;

			location = window.location.search;
			location = location.replace("?","");
			location = location.split("&");

			locationIndex = location.indexOf(property+"=");
			if(locationIndex < 0){
				return false;
			}

			location = location[locationIndex];

			location = location.split("=");
			location = location[1];

			return location;
		}
	}
	function CookieHandler(){

		var cookies;

		cookies = document.cookie.split(';');

		this._ = cookies;
		this.setByHours = setCookieHours;
		this.set = setCookieHours;
		this.setByDays = setCookieDays;
		this.get = getCookie;
		this.check = checkCookie;

		return this;

		function setCookieHours(property, value, horas) {
			var data;
			var validade;

		    data = new Date();
		    data.setTime(data.getTime() + (horas*60*60*1000));

		    validade = "expires="+data.toUTCString();

		    document.cookie = property + "=" + value + "; " + validade;
		}
		function setCookieDays(property, value, dias) {
			var data;
			var validade;

		    data = new Date();
		    data.setTime(data.getTime() + (dias*24*60*60*1000));

		    validade = "expires="+data.toUTCString();

		    document.cookie = property + "=" + value + "; " + validade;
		}
		function getCookie(property) {
			var cookieIndex;
			var cookie;
			var value;

		    property = property + "=";
		    for(cookieIndex = 0; cookies.length > cookieIndex; cookieIndex++){
		        cookie = cookies[cookieIndex];

		        while(cookie.charAt(0) == ' '){
		        	cookie = cookie.substring(1);
		        }
		        if(cookie.indexOf(property) == 0){
		        	value = cookie.substr(property.length);
		        	return value;
		        }
		    }
		    return "";
		}

		function checkCookie(property) {
		    var value;

		    value = getCookie(property);
		   	
		   	if(value){
		   		return true;
		   	}
		   	return false;
		}
	}
	/**
	 * Classe, para manipular data com intenção de download e/ou upload
	 *
	 * @method FileHandler
	 *
	 * @param  {[type]}    data
	 * @param  {Boolean}   isBase
	 *
	 * @return {[type]}
	 */
	function FileHandler(data,isBase){
		//////////////////////////
		//VARIAVES DE INSTANCIA //
		//////////////////////////
			var isBase64;
		///////////////
		//CONSTRUÇÃO //
		///////////////
			isBase64 = XtrGraficoUtil.isset(isBase) ? isBase : true;

	        this._=data;
	        this.upload=upload;
	        this.create=download;
	        this.attachDownload=attachDownload;
	        this.attachUpload=attachUpload;

	        return this;
	    /////////////////////
	    //METODOS PROPRIOS //
	    /////////////////////
			/**
			 * OBTER, em json codificado em base64 o input de \data
			 *
			 * @method  create
			 *
			 @return  {[type]}  [description]
			 */
			function create(){
				var json;
				var base64;

	            json = JSON.stringify(data);
	            base64 = json;
	            if(isBase64)
	           		base64 = Base64.encode(base64);

	            return base64;
	        }
	        /**
	         * FORNECER, arquivo a ser upado
	         *
	         * @method  upload
	         *
	         * @param  {File}    arquivo   [description]
	         * @param  {Function}  callback
	         *
	         * @return  {void}    
	         */
			function upload(arquivo,callback){
				var msg;
				var content;
				var base64;
				var json;
				if(arquivo){
				    var reader = new FileReader();
				    reader.onload = function(item) { 
				        base64 = item.target.result;
				        json = Base64.decode(base64);
				        content = JSON.parse(json);
				       	if(XtrGraficoUtil.iscallable(callback)){
				       		callback();
				       	}
				    }
				    reader.readAsText(arquivo);
				} 
				else {
				    msg = "Carregar, nenhum arquivo foi fornecido";
				    console.warn(msg);
				    alert(msg);
				}
			}
			/**
			 *  FORNECER, elemento que faz o download do arquivo codificado em \create
			 *
			 * @method  download
			 *
			 * @param  {String}    filename 
			 * @param  {Function}  callback
			 *
			 * @return  {void}
			 */
	        function download(filename,callback){
	        	var element;
	        	var base64;

	        	filename = XtrGraficoUtil.isset(filename) ? filename : "xtrGrafico";

	        	base64 = create();

	            element = document.createElement('a');
	            element.setAttribute('href', 'data:data/plain;charset=utf-8,' + encodeURIComponent(base64));
	            element.setAttribute('download', filename);

	            element.style.display = 'none';
	            document.body.appendChild(element);

	            element.click();

	            document.body.removeChild(element);

	            if(XtrGraficoUtil.iscallable(callback)){
	            	callback();
	            }
	        }
	    //////////////////////
	    //METODOS DE CLASSE //
	    //////////////////////	    	
			/**
			 * ADDICIONAR, id do elemento \id que com evento \type fazendo a chamada de \callback
			 * para fazer download do compositeData, com o nome de arquivo \filename
			 *
			 * @method attachDownload
			 *
			 * @param  {String}       id
			 * @param  {String}       type
			 * @param  {Function}     callback
			 * @param  {String}       filename
			 *
			 * @return {void}
			 */
	        function attachUpload(id,type,callback){
	        	var element;
	        	var arquivo;

	        	element = document.getElementById(id);
	        	if(element == null){
	        		console.warn("DataHandler",attachUpload,"didn't find any element with id:",id);
	        		return;
	        	}
	        	element.addEventListener(type,function(event){
	        		arquivo = event.target.files[0]; 
	        		upload(arquivo,callback);
	        	});
	        }	        
			/**
			 * ADDICIONAR, id do elemento \id que com evento \type fazendo a chamada de \callback
			 * para fazer upload do compositeData.
			 *
			 * @method attachDownload
			 *
			 * @param  {String}       id
			 * @param  {String}       type
			 * @param  {Function}     callback
			 *
			 * @return {void}
			 */
	        function attachDownload(id,type,callback,filename){
	        	var element;
	        	var arquivo;

	        	element = document.getElementById(id);
	        	if(element == null){
	        		console.warn("DataHandler",attachDownload,"didn't find any element with id:",id);
	        		return;
	        	}
	        	element.addEventListener(type,function(event){
	        		download(filename,callback);
	        	});
	        }
	}
	/**
	 * Classe, para manipular compositeData, salvar e/ou carregar;
	 *
	 * @method  CompositeDataHandler
	 *
	 * @param  {Object[] | Object}	compositeDatas
	 */
	function CompositeDataHandler(compositeDatas){
		//////////////////////////
		//VARIAVES DE INSTANCIA //
		//////////////////////////
			var compositeDataIndex;
		///////////////
		//CONSTRUÇÃO //
		///////////////
			if(!XtrGraficoUtil.isset(compositeDatas)){
				compositeDatas = [];
			}

			compositeDataIndex = 0;			

			this.load=load;
			this.moveTo=moveTo;
			this.next=next;
			this.current=current;
			this.previous=previous;
			this.save=save;
			this.push=save;
			this.override=override;
			this.getSeeker=getSeeker;
			this.search=search;
			this.addToAll=addToAll;

			return this;
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
			function addToAll(property,value){
				var compositeData;
				var compositeDataIndex;

				for(compositeDataIndex = 0; compositeDatas.length > compositeDataIndex; compositeDataIndex++){
					compositeData = compositeDatas[compositeDataIndex];
					compositeData[property] = value;
				}
			}
			/**
			 * ADICIONAR, novo compositeData ao \CompositeDataHandler\compositeDatas
			 *
			 * @method save
			 *
			 * @param  {Object} compositeData
			 *
			 * @return {void}
			 */
			function save(compositeData){
				compositeDatas.push(compositeData);
				compositeDataIndex = compositeDatas.length-1;
			}
			/**
			 * ADICIONAR e SOBRESCREVER, novo compositeData ao \CompositeDataHandler\compositeDatas
			 *
			 * @method override
			 *
			 * @param  {Object} compositeData
			 *
			 * @return {void}
			 */
			function override(compositeData){
				compositeDatas = [];
				compositeDataIndex = 0;
				compositeDatas.push(compositeData);
			}
			/**
			 * OBTER, compositeDatas em \CompositeDataHandler\compositeDatas
			 *
			 * @method load
			 *
			 * @return {Object[]}
			 */
			function load(){
				return compositeDatas;
			}
			/**
			 * OBTER, compositeData em \CompositeDataHandler\compositeDatas\compositeDataIndex
			 *
			 * @method current
			 *
			 * @return {Object}
			 */
			function current(){

				return compositeDatas[compositeDataIndex];
			}
			/**
			 * MOVER, \compositeDataIndex para o index fornecido \val
			 *
			 * @method moveTo
			 *
			 * @param  {Integer} val
			 *
			 * @return {Self}
			 */
			function moveTo(val){
				if(0 <= val && val < compositeDatas.length){
					currentIndex = val;
				}
				return this;
			}
			/**
			 * MOVER, \compositeDataIndex para o proximo
			 *
			 * @method next
			 *
			 * @return {Self}
			 */
			function next(){
				if(compositeDataIndex <= compositeDatas.length){
					compositeDataIndex++;
				}
				return this;
			}
			/**
			 * MOVER, \compositeDataIndex para o anterior
			 *
			 * @method previous
			 *
			 * @return {Self}
			 */
			function previous(){
				if(compositeDataIndex > 0){
					compositeDataIndex--;
				}
				return this;
			}
			/**
			 * OBTER, posição atual do \compositeDataIndex
			 *
			 * @method getSeeker
			 *
			 * @return {Integer}
			 */
			function getSeeker(){
				return compositeDataIndex;
			}
			/**
			 * OBTER, compositeData ou compositeDatas em \compositeDatas com base no tipo em \val
			 *
			 * @method search
			 *
			 * @param  {String} tipo
			 *
			 * @return {Object | Object[]}
			 */
			function search(tipo,pos){
				var compositeData;
				var index;
				var matchs;

				tipo = XtrGraficoUtil.isarray(tipo) ? tipo : [tipo];

				matchs = [];
				for(index = 0; compositeDatas.length > index; index++){
					compositeData = compositeDatas[index];
					if(tipo.indexOf(compositeData.tipo) >= 0){
						matchs.push(compositeData);
					}
				};
				if(XtrGraficoUtil.isset(pos))
					return matchs[pos];

				return matchs;
			}
	}
	/**
     * Object, para manipular dados de \compositeData\series e fazer interpolacação e/ou extrapolação
     *
     * @type  {Object}
     */
    var XtrNumerico = {
        getPoint:function(compositeData,serieIndex,pointIndex){
            var serie;
            var X,Y;

            serie = compositeData.series[serieIndex];
            X = parseFloat(compositeData.rotulos[pointIndex]);
            Y = serie.dados[pointIndex];

            return {
                titulo: serie.titulo,
                x: X,
                y: Y
            };
        },
        getAllPoints:function(comp,serieIndex){
            var serie = comp.series[serieIndex];
            var pontosArray = serie.dados;
            var pontosObj = [];
            for (var i = 0; i < pontosArray.length; i++) {
                var ponto = pontosArray[i];
                var pontoObj = this.getPoint(comp,serieIndex,i);
                pontosObj.push(pontoObj);
            };
            return pontosObj;
        },
        lagrande:function(alvo,mapa){
            var x=[];
            var y=[];
            var titulo = mapa[0].titulo;
            for(var pontoIndex=0; mapa.length > pontoIndex;pontoIndex++){
                var ponto = mapa[pontoIndex];
                x.push(ponto.x);
                y.push(ponto.y);
            }
            var L=[];
            var parcial = []
            var somatorio = 0;
            dosomething('------------\n',titulo);
            for(var i = 0; i < x.length; i++) {
                dosomething("X:",x[i],"\tY:",y[i]);
                L[i]=1;
                for (var j = 0; j < x.length; j++) {
                    if(j != i){
                        L[i] = L[i] * (alvo - x[j]) / (x[i] - x[j]);
                    }
                };
                parcial[i] = L[i]*y[i];
            };
            for (var i = 0; i < parcial.length; i++) {
                somatorio = somatorio + parcial[i];
            };
            dosomething("\nXa:",alvo,"\tP(Xa):",somatorio);
            return somatorio;
        },
        makeInterpolationArray:function(rotulos){
            var toReturn = [];
            var rotuloBefore;
            var rotuloCurrent;
            for (var rotuloIndex = 1; rotulos.length > rotuloIndex; rotuloIndex++) {
                rotuloCurrent = rotulos[rotuloIndex];
                rotuloBefore = rotulos[rotuloIndex-1];

                var obj={
                    con: rotuloCurrent+" <-> "+rotuloBefore,
                    pos: rotuloIndex
                };

                toReturn.push(obj);

            };
            return toReturn;
        },
        getPointsIndexFrom:function(compositeData,alvo,pontos){
            var decay=0;
            var pointsIndex = [];
            var startPointIndex = Math.floor(alvo);
            
            var maxIndex = compositeData.rotulos.length;

            pointsIndex.push(startPointIndex);
            var countPontos = 1;

            while(pontos >= countPontos){
                addDecay(countPontos);
                countPontos++;
            }
            var auxIndex = startPointIndex-decay-1;     
            if(auxIndex >= 0)
                pointsIndex.push(auxIndex);

            pointsIndex.sort(XtrGraficoUtil.compare);

            return pointsIndex;

            function addDecay(n){
                if(startPointIndex+n < maxIndex){                                         
                    pointsIndex.push(startPointIndex+n);
                }                                    
                else if(startPointIndex-n >= 0){
                   pointsIndex.push(startPointIndex-n);
                   decay=n;
                }
            }
        },
        getPointsFrom:function(compositeData,serieAlvo,alvo,pontos){

            var pointsIndex = this.getPointsIndexFrom(compositeData,alvo,pontos);

            var points = [];

            for (var pi = 0; pi < pointsIndex.length; pi++) {
                var pointIndex = pointsIndex[pi];
                var ponto = this.getPoint(compositeData,serieAlvo,pointIndex)
                points.push(ponto);
            };

            return points;
        },
        interpolate:function(compositeData,serieAlvo,alvo,pontos){
            var rotulos = compositeData.rotulos;

            var nPontos=3;
            if(pontos){
                nPontos = pontos;
            } 

            var Pontos = this.getPointsFrom(compositeData,serieAlvo,alvo,nPontos);
            var rotuloInicial = parseFloat(rotulos[alvo]);
            var rotuloFinal = parseFloat(rotulos[alvo-1]);

            var rotuloMedio = (rotuloInicial + rotuloFinal)/2;

            var pxRoutloMedio = this.lagrande(rotuloMedio,Pontos);

            return {x:rotuloMedio,y:pxRoutloMedio};
        },
        extrapolate:function(compositeData,serieAlvo,alvo,pontos){
            var rotulos = compositeData.rotulos;

            var nPontos=1;
            if(pontos){
                nPontos = pontos;
            } 
            var first = parseFloat(rotulos[0]);
            var last = parseFloat(rotulos[rotulos.length-1]);
            var maxIndex=0;
            var maxName=first;
            if(last > first){
                maxIndex = rotulos.length-1;
                maxName = last;
            }
            var Pontos = this.getPointsFrom(compositeData,serieAlvo,maxIndex,nPontos);
            var rotuloAlvo = maxName+1;
            var pxRotuloAlvo = this.lagrande(rotuloAlvo,Pontos);

            return {x:rotuloAlvo,y:pxRotuloAlvo};
        }
    };