// @include 'PhotoShopUtils.jsxinc'
Main();

function Main()
{
	if (app.documents.length <= 0) {

		alert("You should have a document open for export!");
		return;
	}

	//方式一，用户主动选取一个目录
	//var destFolder = Folder.selectDialog("Choose destination folder for export.");

	//方式二，在Ps的所在目录建一个Output目录
	var destFolder = Folder(Folder(app.activeDocument.fullName.parent).fsName + "/Output");
	
	if(destFolder.exists)
	{
		var files = destFolder.getFiles("*");
		
		for (var i = 0; i< files.length; i++)
		{
			files[i].remove();
		}
	}
	else
	{
		destFolder.create();
	}

	if(!destFolder)
	{
		alert("You don't select destination folder, please retry.");
		return;
	}

    var cacheRulerUnits = app.preferences.rulerUnits;
    var cacheTypeUnits = app.preferences.typeUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

	var activeDocRef = app.activeDocument;

	var exportLayers = new Array();
	CollectExportArtLayers(exportLayers, activeDocRef, true);

	if(exportLayers.length > 0)
	{
		ExportArtLayers(exportLayers, activeDocRef, destFolder);
		alert("Export finish.");
	}
	else
	{
		alert("Nothing export.");
	}

	app.activeDocument = activeDocRef;

	app.preferences.rulerUnits = cacheRulerUnits;
    app.preferences.typeUnits = cacheTypeUnits;
}

function ExportArtLayers(artLayerList, hostDocRef, destFolder)
{
	var exportDocRef = app.documents.add(100, 100, hostDocRef.resolution, "ExportDoc", NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);

	for (var index = 0, length = artLayerList.length; index < length; index++) 
	{
		var rasterizedLayer = undefined;
		try
		{
			//激活宿主文档，读取参数并复制
			app.activeDocument = hostDocRef;

			var originalLayer = artLayerList[index];

			var bounds = originalLayer.bounds;
			var originalW = bounds[2] - bounds[0];
			var originalH = bounds[3] - bounds[1];

			//解析参数
			var context = GetProcessedArtLayerNineGridParams(originalLayer.name);

			if(context.error)
			{
				alert(context.originalName + " process param error\n" + context.error);
			}

			rasterizedLayer = originalLayer.duplicate(originalLayer, ElementPlacement.PLACEAFTER);
			rasterizedLayer.rasterize(RasterizeType.ENTIRELAYER);
			rasterizedLayer.copy();

			//激活导出文档，缩放Canvas并粘贴
			app.activeDocument = exportDocRef;
			app.activeDocument.resizeCanvas(originalW, originalH, AnchorPosition.MIDDLECENTER);
			var duplicatedLayer = app.activeDocument.paste(false);
			duplicatedLayer.opacity = rasterizedLayer.opacity;
			duplicatedLayer.fillOpacity = rasterizedLayer.fillOpacity;

			//九切切图,修改
			if(context.nineGridValid)
			{
				PhotoShopUtils.NineGridCrop(duplicatedLayer, exportDocRef, context.leftPadding, context.topPadding, context.rightPadding, context.bottomPadding, context.centerW, context.centerH);
			}

			//导出到文件
			PhotoShopUtils.ExportPNG(exportDocRef, context.processedName, destFolder, false);
		}
		catch(e)
		{
			alert("ExportArtLayers exception originalLayer is " + originalLayer.name + "\n" + e);
		}
		finally
		{
			if(rasterizedLayer != undefined)
			{
				app.activeDocument = hostDocRef;
				rasterizedLayer.remove();
				rasterizedLayer = undefined;
			}
			PhotoShopUtils.ClearDoc(exportDocRef);
		}
	}

	exportDocRef.close(SaveOptions.DONOTSAVECHANGES);
}

function CollectExportArtLayers(artLayerList, currentSet, visibleOnly)
{
	for( var i = 0; i < currentSet.artLayers.length; i++) 
	{
		var currentLayer = currentSet.artLayers[i];
		var pass = IsArtLayerExport(currentLayer, visibleOnly);

		if(pass)
		{
			artLayerList.push(currentLayer);
		}
	}

	for( var i = 0; i < currentSet.layerSets.length; i++) 
	{
		var currentLayerSet = currentSet.layerSets[i];

		var pass = IsLayerSetScan(currentLayerSet, visibleOnly);
		if(pass)
		{
			CollectExportArtLayers(artLayerList, currentLayerSet, visibleOnly);
		}
    }
}

function IsLayerSetScan(layer, visibleOnly)
{
	return !visibleOnly || layer.visible;
}

//ArtLayer导出规则
//1.名字不包含中文
//2.类型不为TXET
//3.该图层的容器名字为export(忽略大小写)
//4.是否只导出可见图层
function IsArtLayerExport(layer, visibleOnly)
{
	var parentName = layer.parent.name.toLowerCase();
	return (layer.kind != LayerKind.TEXT) && !ContainsChinese(layer.name) && (!visibleOnly || layer.visible) && parentName == "export";
}

function ContainsChinese(str)
{
    var _chinestReg =/[\u4E00-\u9FA5]/;
    return _chinestReg.test(str);     
}

//九切命名格式为 name@leftPadding:topPadding:rightPadding:bottomPadding:centerW:centerH 
//eg:  picture001@30:30:30:30:10:10
function GetProcessedArtLayerNineGridParams(artLayerName)
{
	var context = new Object();
	context.originalName = artLayerName;
	context.processedName = artLayerName;
	context.nineGridValid = false;

	var error = undefined;

	if(artLayerName.indexOf("@") > 0)
	{
		var valid = true;
		
		var stringArray = undefined;
		var paramArray = undefined;
		try
		{
			stringArray = artLayerName.split("@");
			paramArray = stringArray[1].split(":");
			if(paramArray.length != 6)
			{
				error = "nine grid param count not 6.";
				valid = false;
			}
			else
			{
				for(var i = 0; i< 6; i++)
				{
					if(isNaN(Number(paramArray[i])))
					{
						error = "nine grid param not number.";
						valid = false;
						break;
					}
				}
			}
		}
		catch(e)
		{
			error = "nine grid param process exception.\n" + e;
			valid = false;
		}

		context.error = error;

		if(valid)
		{
			context.nineGridValid = true;
			context.processedName = stringArray[0];
			context.leftPadding = Number(paramArray[0]);
			context.topPadding = Number(paramArray[1]);
			context.rightPadding = Number(paramArray[2]);
			context.bottomPadding = Number(paramArray[3]);
			context.centerW = Number(paramArray[4]);
			context.centerH = Number(paramArray[5]);
		}
	}

	return context;
}
