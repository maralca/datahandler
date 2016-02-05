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
		/////////////////////
		//METODOS PROPRIOS //
		/////////////////////
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
			function getSpecificCompositeData(principal,descendentes,kwargs){
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
						rotulos: principal.dadosFormatados,
						links: principal.url,		
						dado: tipoDado,
						incosistencias: [],
						polados: []
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
			function getCompositeData(principal,descendentes){
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
					rotulos: principal.dadosFormatados,
					links: principal.url,		
					dado: principal.tipo,
					incosistencias: [],
					polados: []
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
			function getCompositeDatas(principal,descendentes,graficos){
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

					compositeData = getCompositeData(principal,grupo);

					if(XtrGraficoUtil.isset(compositeData.tipo) ? compositeData.tipo!=null : false)
						compositeDatas.push(compositeData);
						
					for(innerGrupoIndex = 0; grupo.length > innerGrupoIndex && grupo.length > 1; innerGrupoIndex++){
						innerGrupo = grupo[innerGrupoIndex];
						compositeData = getCompositeData(principal,innerGrupo);
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
					compositeData = getSpecificCompositeData(principal,descendentes,kwargs);
					if(XtrGraficoUtil.isobj(compositeData) ? compositeData.tipo!=null : false)
						compositeDatas.push(compositeData);
				};

				kwargs = {
					tipo: "tabela",
					mostrar: "false",
					colunas: "all"
				}
				compositeData = getSpecificCompositeData(principal,descendentes,kwargs)

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
				}
				console.info("------------------");
				if(tem.uma.categoria && tem.uma.serie){
					return "";
				}				
				tipo = principal._.tipo;

				tipoIndex = tipos.principal.indexOf(tipo);

				if(tipoIndex==0){ //Cronologica

					console.info("Dividida em períodos iguais?",tem.periodosIguais);

					if(tem.periodosIguais){			

						console.info("Coeficientes horizontais e/ou tem Índices?",
									tem.coeficiente && tem.soma.horizontal || tem.indice);	

						if(tem.coeficiente && tem.soma.horizontal || tem.indice){

							console.info("Quantas séries de dados?",
										descendentes.length);

							if(tem.uma.serie){
								grafico = "line";
								escala = getScale(descendentes);
								console.info(grafico,escala);
								return [grafico,escala];
							}
							else{
								grafico = "line"; //agrupada
								escala = getScale(descendentes);
								console.info(grafico,escala);
								return [grafico,escala];
							}
						}
						console.info("Valores absolutos ou porcentagens verticais?",tem.absoluto || tem.coeficiente,'\n',
									"Valores somam verticalmente?",tem.soma.vertical);

						if((tem.absoluto || tem.coeficiente && tem.soma.vertical)&& tem.soma.vertical){

							console.info("Quantas séries de dados?",descendentes.length);

							if(tem.uma.serie){
								grafico = "area";
								escala = "linear";
								console.info(grafico,escala);
								return [grafico,escala];
							}

							console.info("Valores absolutos?",tem.absoluto,'\n',
								"Valores positivos?",tem.positivos,'\n',
								"Valores somam horizontalmente?",tem.soma.horizontal);

							if(tem.absoluto && tem.positivos && tem.soma.horizontal){
								grafico = "stackedarea";
								escala = "linear";
								console.info(grafico,escala);
								return [grafico,escala];
							}
						}
					}
					tipoIndex++;
				}
				if(tipoIndex==1){ //Ordinal
					if(tem.abaixoDoLimite){

						console.info("Quantas séries de dados?",descendentes.length);

						if(tem.uma.serie){
							grafico = "columns";
							escala = "linear";
							console.info(grafico,escala);
							return [grafico,escala];
						}

						console.info("Valores positivos?",tem.positivos,'\n',
							"Valores somam horizontalmente?",tem.soma.horizontal);

						if(!(tem.positivos && tem.soma.horizontal)){
							grafico = "clusteredcolumns";
							escala = getScale(descendentes);
							console.info(grafico,escala);
							return [grafico,escala];
						}

						console.info("Valores absolutos?",tem.absoluto);

						if(tem.absoluto){
							grafico = "stackedcolumns";
							escala = "linear";
							console.info(grafico,escala);
							return [grafico,escala];
						}
						console.info("Porcentagens horizontais?",tem.coeficiente && tem.soma.horizontal);

						if(tem.coeficiente && tem.soma.horizontal){
							grafico = "stackedcolumns";
							escala = "justa";
							console.info(grafico,escala);
							return [grafico,escala];
						}
						else{
							grafico = "clusteredcolumns";
							escala = getScale(descendentes);
							console.info(grafico,escala);
							return [grafico,escala];
						}
					}
				}				
				if(tipoIndex==3){ //geografica
					grafico = "geografica";
					escala = "linear";

					if(tem.mesmaRegiao){
						if(tem.mesmoEstado){
							grafico += "/"+tem.mesmoEstado;
						}
						else{
							grafico += "/"+tem.mesmaRegiao
						}
					}
					else{
						grafico += "/brasil";
					}
					console.info(grafico,escala);
					return [grafico,escala];
				}
				else{
					tipoIndex--;
				}
				if(tipoIndex==2){ //nominal
					console.info("1 série de dados?",tem.uma.serie,'\n',
						"Valores absolutos ou porcentagens verticais?",tem.coeficiente && tem.soma.vertical || tem.absoluto,'\n',
						"Valores positivos?",tem.positivos,'\n',
						"Valores somam verticalmente?",tem.soma.vertical);
					if(tem.uma.serie && tem.coeficiente && tem.soma.vertical || tem.absoluto && tem.positivos && tem.soma.vertical){
						grafico = "pie";
						escala = "linear";
						console.info(grafico,escala);
						return [grafico,escala];
					}
				}

				console.info("Quantas séries de dados?",descendentes.length);

				if(tem.maisDeUma){
					grafico = "bars";
					escala = "linear";
					console.info(grafico,escala);
					return [grafico,escala];
				}

				console.info("Valores positivos? Valores somam horizontalmente?",
							tem.positivos,'e',tem.soma.horizontal);

				if(tem.positivos && tem.soma.horizontal){

					console.info("Valores absolutos?",tem.absoluto);

					if(tem.absoluto){
						grafico = "stackedbars";
						escala = "linear";
						console.info(grafico,escala);
						return [grafico,escala];
					}

					console.info("Porcentagens horizontais?",tem.coeficiente && tem.soma.horizontal);

					if(tem.coeficiente && tem.soma.horizontal){
						grafico = "stackedbars";
						escala = "justa";
						console.info(grafico,escala);
						return [grafico,escala];
					}
				}
				
				grafico = "clusteredbars";
				escala = getScale(descendentes);
				console.info(grafico,escala);
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
					console.info("Digest of DataHandler was request by",arguments.callee.caller);

					colunas = {
						principal: {},
						descendentes: []
					}

					Data = XtrGraficoUtil.clone(data);

					digestEnable = false;
					
					colunas.principal = Data.coluna.shift();

					colunas.descendentes = Data.coluna;

					graficos = Data.grafico;

					compositeDatas = getCompositeDatas(colunas.principal,colunas.descendentes,graficos);
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
		var regioes;
		///////////////
		//CONSTRUÇÃO //
		///////////////
			regioes = {
				"norte": ["ac","am","ap","pa","ro","rr","to"],
				"nordeste": ["al","ba","ce","ma","pb","pe","pi","rn","se"],
				"centro-oeste": ["df","go","ms","mt"],
				"sudeste": ["sp","es","mg","rj"],
				"sul": ["pr","rs","sc"]
			}
			this.periodosIguais = periodosIguais();
			this.mesmoEstado = mesmoEstado();
			this.mesmaRegiao = mesmaRegiao();
			this.todasSaoCidades = isEveryoneCity();
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
				hasChange = hasChange || principal.tipo != "cronologica";

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

			function isEveryoneCity(){
				var rotulos,rotulo;
				var rotuloIndex;

				var isEveryone;

				rotulos = principal.dados;

				isEveryone = true;

				for(rotuloIndex = 0; rotulos.length > rotuloIndex && isEveryone; rotuloIndex++){
					rotulo = rotulos[rotuloIndex];
					isEveryone = rotulo.split("/").length > 1;
				};
				return isEveryone;
			}
			/**
			 * INDENTIFICAR se coluna principal possui todos os municipios do mesmo estado
			 *
			 * @method mesmoEstado
			 *
			 * @return {Boolean}
			 */
			function mesmoEstado(){
				var rotulos;
				var rotuloCurrent,rotuloBefore;
				var rotuloIndex;				

				var hasChange;

				var estados;

				rotulos = principal.dados;

				hasChange = rotulos.length <= 1;
				hasChange = hasChange || principal.tipo != "geografica";
				hasChange = hasChange || !isEveryoneCity();

				for(rotuloIndex = 1; rotulos.length > rotuloIndex && !hasChange; rotuloIndex++){
					rotuloCurrent = rotulos[rotuloIndex].split("/");
					rotuloCurrent = rotuloCurrent[1];
					rotuloCurrent = rotuloCurrent.replace(" ","").toLowerCase();

					rotuloBefore = rotulos[rotuloIndex-1].split("/");
					rotuloBefore = rotuloBefore[1];
					rotuloBefore = rotuloBefore.replace(" ","").toLowerCase();
					hasChange = rotuloCurrent != rotuloBefore;
				};
				if(!hasChange)
					return rotuloCurrent;

				return !hasChange;
			}

			function mesmaRegiao(){
				var rotulos;				
				var rotuloCurrent,rotuloBefore;
				var rotuloIndex;

				var regiao;
				var regiaoNome;

				var hasChange;				

				rotulos = principal.dados;

				hasChange = rotulos.length <= 1;
				hasChange = hasChange || principal.tipo != "geografica";
				for(rotuloIndex = 1; rotulos.length > rotuloIndex && !hasChange; rotuloIndex++){					
					rotuloCurrent = rotulos[rotuloIndex];
					rotuloBefore = rotulos[rotuloIndex-1];

					if(isEveryoneCity()){
						rotuloCurrent = rotuloCurrent.split("/");
						rotuloBefore = rotuloBefore.split("/");
						rotuloCurrent = rotuloCurrent[1];
						rotuloBefore = rotuloBefore[1];
					}

					rotuloCurrent = rotuloCurrent.replace(" ","").toLowerCase();
					rotuloBefore = rotuloBefore.replace(" ","").toLowerCase();

					for(regiaoNome in regioes){
						regiao = regioes[regiaoNome];
						if(regiao.indexOf(rotuloCurrent) >= 0){
							hasChange = regiao.indexOf(rotuloCurrent) != regiao.indexOf(rotuloBefore);
							break;
						}
					}
				};
				if(!hasChange)
					return regiaoNome;

				return !hasChange;
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
	/**
	 * Classe, para manipular data com intenção de download e/ou upload
	 *
	 * @method  FileHandler
	 *
	 * @param  {any}	data 
	 */
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

			return this;
		//////////////////////
		//METODOS DE CLASSE //
		//////////////////////
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
	var Base64={
	    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	    encode: function(e) {
	        var t = "";
	        var n, r, i, s, o, u, a;
	        var f = 0;
	        e = Base64._utf8_encode(e);
	        while (f < e.length) {
	            n = e.charCodeAt(f++);
	            r = e.charCodeAt(f++);
	            i = e.charCodeAt(f++);
	            s = n >> 2;
	            o = (n & 3) << 4 | r >> 4;
	            u = (r & 15) << 2 | i >> 6;
	            a = i & 63;
	            if (isNaN(r)) {
	                u = a = 64
	            } else if (isNaN(i)) {
	                a = 64
	            }
	            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
	        }
	        return t
	    },
	    decode: function(e) {
	        var t = "";
	        var n, r, i;
	        var s, o, u, a;
	        var f = 0;
	        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	        while (f < e.length) {
	            s = this._keyStr.indexOf(e.charAt(f++));
	            o = this._keyStr.indexOf(e.charAt(f++));
	            u = this._keyStr.indexOf(e.charAt(f++));
	            a = this._keyStr.indexOf(e.charAt(f++));
	            n = s << 2 | o >> 4;
	            r = (o & 15) << 4 | u >> 2;
	            i = (u & 3) << 6 | a;
	            t = t + String.fromCharCode(n);
	            if (u != 64) {
	                t = t + String.fromCharCode(r)
	            }
	            if (a != 64) {
	                t = t + String.fromCharCode(i)
	            }
	        }
	        t = Base64._utf8_decode(t);
	        return t
	    },
	    _utf8_encode: function(e) {
	        e = e.replace(/\r\n/g, "\n");
	        var t = "";
	        for (var n = 0; n < e.length; n++) {
	            var r = e.charCodeAt(n);
	            if (r < 128) {
	                t += String.fromCharCode(r)
	            } else if (r > 127 && r < 2048) {
	                t += String.fromCharCode(r >> 6 | 192);
	                t += String.fromCharCode(r & 63 | 128)
	            } else {
	                t += String.fromCharCode(r >> 12 | 224);
	                t += String.fromCharCode(r >> 6 & 63 | 128);
	                t += String.fromCharCode(r & 63 | 128)
	            }
	        }
	        return t
	    },
	    _utf8_decode: function(e) {
	        var t = "";
	        var n = 0;
	        var r = c1 = c2 = 0;
	        while (n < e.length) {
	            r = e.charCodeAt(n);
	            if (r < 128) {
	                t += String.fromCharCode(r);
	                n++
	            } else if (r > 191 && r < 224) {
	                c2 = e.charCodeAt(n + 1);
	                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
	                n += 2
	            } else {
	                c2 = e.charCodeAt(n + 1);
	                c3 = e.charCodeAt(n + 2);
	                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
	                n += 3
	            }
	        }
	        return t
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
            console.info('------------\n',titulo);
            for(var i = 0; i < x.length; i++) {
                console.info("X:",x[i],"\tY:",y[i]);
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
            console.info("\nXa:",alvo,"\tP(Xa):",somatorio);
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
        getPointsIndexFrom:function(comp,alvo,pontos){
            var decay=0;
            var pointsIndex = [];
            var startPointIndex = Math.floor(alvo);
            
            var maxIndex = comp.rotulos.length;

            pointsIndex.push(startPointIndex);
            var countPontos = 1;

            while(pontos >= countPontos){
                addDecay(countPontos);
                countPontos++;
            }
            var auxIndex = startPointIndex-decay-1;     
            if(auxIndex >= 0)
                pointsIndex.push(auxIndex);

            pointsIndex.sort(function(a,b){ return a < b; });

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
        getPointsFrom:function(comp,serieAlvo,alvo,pontos){

            var pointsIndex = this.getPointsIndexFrom(comp,alvo,pontos);

            var points = [];

            for (var pi = 0; pi < pointsIndex.length; pi++) {
                var pointIndex = pointsIndex[pi];
                var ponto = this.getPoint(comp,serieAlvo,pointIndex)
                points.push(ponto);
            };

            return points;
        },
        interpolate:function(comp,serieAlvo,alvo,pontos){
            var rotulos = comp.rotulos;

            var nPontos=3;
            if(pontos){
                nPontos = pontos;
            } 

            var Pontos = this.getPointsFrom(comp,serieAlvo,alvo,nPontos);
            var rotuloInicial = parseFloat(rotulos[alvo]);
            var rotuloFinal = parseFloat(rotulos[alvo-1]);

            var rotuloMedio = (rotuloInicial + rotuloFinal)/2;

            var pxRoutloMedio = this.lagrande(rotuloMedio,Pontos);

            return {x:rotuloMedio,y:pxRoutloMedio};
        },
        extrapolate:function(comp,serieAlvo,alvo,pontos){
            var rotulos = comp.rotulos;

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
            var Pontos = this.getPointsFrom(comp,serieAlvo,maxIndex,nPontos);
            var rotuloAlvo = maxName+1;
            var pxRotuloAlvo = this.lagrande(rotuloAlvo,Pontos);

            return {x:rotuloAlvo,y:pxRotuloAlvo};
        }
    };