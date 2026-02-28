import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AppStore, parseFirestoreDate } from '../services/app.store';
import { Timestamp } from 'firebase/firestore';
import { ResultRaw } from '../model/result-raw';
import { distinctionRules } from '../model/distinction-rules';

interface PreviewItem {
  type: 'archer' | 'resultat' | 'distinction';
  action: 'create' | 'skip';
  data: any;
  reason?: string;
}

@Component({
  selector: 'app-results-upload',
  standalone: true,
  imports: [
    CommonModule, 
    FileUploadModule, 
    ProgressBarModule, 
    MessageModule,
    TableModule,
    ButtonModule
  ],
  templateUrl: './results-upload.component.html',
  styleUrl: './results-upload.component.scss'
})
export class ResultsUploadComponent {
  private firestoreService = inject(AppStore);
  
  step: 'upload' | 'preview' | 'importing' | 'done' = 'upload';
  previewData: PreviewItem[] = [];
  parsedResults: ResultRaw[] = [];
  
  newArchers = 0;
  newResults = 0;
  newDistinctions = 0;
  skippedResults = 0;
  
  progress = 0;
  successMessage = '';
  errorMessage = '';
  totalItems = 0;
  processedItems = 0;
  
  showFormatHelp = false;

  async onSelect(event: FileSelectEvent) {
    try {
      this.reset();
      const file = event.files[0];
      const text = await file.text();
      this.parsedResults = this.parseCSV(text);
      await this.generatePreview();
      this.step = 'preview';
    } catch (error: any) {
      console.error('Erreur lors de l\'analyse du fichier:', error);
      this.errorMessage = `Erreur lors de l'analyse: ${error.message}`;
    }
  }

  async generatePreview() {
    this.previewData = [];
    this.newArchers = 0;
    this.newResults = 0;
    this.newDistinctions = 0;
    this.skippedResults = 0;

    this.parsedResults.sort((a, b) => {
      if (a.licence < b.licence) return -1;
      if (a.licence > b.licence) return 1;
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      if (a.dateDebutConcours < b.dateDebutConcours) return -1;
      if (a.dateDebutConcours > b.dateDebutConcours) return 1;
      return 0;
    });

    // Copies locales pour éviter de muter le cache (push de archers/résultats temporaires)
    const existingArchers = [...(await this.firestoreService.getArchers())];
    const existingResults = [...(await this.firestoreService.getResultats())];
    const existingDistinctions = await this.firestoreService.getDistinctions();

    const bestDistinctionsFromUpload = new Map<string, any>();

    for (const resultRaw of this.parsedResults) {
      await this.analyzeResultForBestDistinction(
        resultRaw,
        existingArchers,
        existingResults,
        bestDistinctionsFromUpload
      );
    }

    for (const [key, distinctionInfo] of bestDistinctionsFromUpload.entries()) {
      const [archerId, arme, discipline, distance] = key.split('_');

      const existingForKey = existingDistinctions.filter(d => {
        const resultat = existingResults.find(r => r.id === d.resultatId);
        return d.archerId === archerId &&
               d.discipline === discipline &&
               d.distance === parseInt(distance) &&
               resultat?.arme === arme;
      });

      let shouldCreate = true;

      if (existingForKey.length > 0) {
        let bestExisting = existingForKey[0].nom;

        for (const existingDist of existingForKey) {
          const sameOrBetter = distinctionRules.getSameOrBetter(
            existingDist.nom,
            discipline,
            arme
          );
          if (sameOrBetter && !sameOrBetter.includes(bestExisting)) {
            bestExisting = existingDist.nom;
          }
        }

        const sameOrBetter = distinctionRules.getSameOrBetter(
          bestExisting,
          discipline,
          arme
        );

        if (sameOrBetter && sameOrBetter.includes(distinctionInfo.nom)) {
          if (bestExisting === distinctionInfo.nom) {
            shouldCreate = false;
          } else {
            shouldCreate = true;
          }
        } else {
          shouldCreate = false;
        }
      }

      if (shouldCreate) {
        this.previewData.push({
          type: 'distinction',
          action: 'create',
          data: distinctionInfo
        });
        this.newDistinctions++;
      }
    }
  }

  async analyzeResultForBestDistinction(
    resultRaw: ResultRaw, 
    existingArchers: any[], 
    existingResults: any[],
    bestDistinctionsFromUpload: Map<string, any>
  ) {
    let archer = existingArchers.find(a => a.noLicence === resultRaw.licence);
    
    if (!archer) {
      const existingPreview = this.previewData.find(
        p => p.type === 'archer' && p.data.noLicence === resultRaw.licence
      );
      
      if (!existingPreview) {
        this.previewData.push({
          type: 'archer',
          action: 'create',
          data: {
            nom: resultRaw.nom,
            prenom: resultRaw.prenom,
            noLicence: resultRaw.licence
          }
        });
        this.newArchers++;
      }
      
      archer = {
        id: 'temp_' + resultRaw.licence,
        noLicence: resultRaw.licence,
        nom: resultRaw.nom,
        prenom: resultRaw.prenom
      };
      existingArchers.push(archer);
    }

    if (resultRaw.discipline === 'S') {
      const formule = resultRaw.formuleTir;
      if (formule === '2X18M') {
        this.processResultForBestDistinction(
          resultRaw, archer, existingResults, bestDistinctionsFromUpload,
          { distance: resultRaw.distance, score: resultRaw.score }
        );
      } else if (formule === '2X25M + 2X18M') {
        this.processResultForBestDistinction(
          resultRaw, archer, existingResults, bestDistinctionsFromUpload,
          { distance: 25, score: (resultRaw.scoreDist1 || 0) + (resultRaw.scoreDist2 || 0), blason: '60' }
        );
        this.processResultForBestDistinction(
          resultRaw, archer, existingResults, bestDistinctionsFromUpload,
          { distance: 18, score: (resultRaw.scoreDist3 || 0) + (resultRaw.scoreDist4 || 0) }
        );
      }
    } else if (resultRaw.discipline === 'T') {
      this.processResultForBestDistinction(
        resultRaw, archer, existingResults, bestDistinctionsFromUpload,
        { distance: resultRaw.distance, score: resultRaw.score }
      );
    }
  }

  processResultForBestDistinction(
    resultRaw: ResultRaw,
    archer: any,
    existingResults: any[],
    bestDistinctionsFromUpload: Map<string, any>,
    overrides: any = {}
  ) {
    const result = {
      archerId: archer.id,
      distance: overrides.distance || resultRaw.distance,
      dateDebutConcours: this.parseDate(resultRaw.dateDebutConcours),
      arme: resultRaw.arme,
      blason: overrides.blason || resultRaw.blason,
      categorie: resultRaw.categorie,
      numDepart: resultRaw.numDepart,
      saison: resultRaw.saison,
      discipline: resultRaw.discipline,
      score: overrides.score || resultRaw.score,
      // Ajouter les infos de l'archer pour l'affichage
      archerNom: archer.nom,
      archerPrenom: archer.prenom
    };

    const exists = existingResults.some((r: any) => {
      // Deux résultats sont identiques si même archer, date, départ, arme, score
      const sameArcher = r.archerId === result.archerId;
      // parseFirestoreDate gère les Timestamps Firestore, les objets {seconds,nanoseconds} et les ISO strings
      const rDate = parseFirestoreDate(r.dateDebutConcours);
      const sameDate = rDate ? rDate.getTime() === result.dateDebutConcours.getTime() : false;
      const sameDepart = r.numDepart === result.numDepart;
      const sameArme = r.arme === result.arme;
      const sameScore = r.score === result.score;

      return sameArcher && sameDate && sameDepart && sameArme && sameScore;
    });

    if (exists) {
      this.previewData.push({
        type: 'resultat',
        action: 'skip',
        data: result,
        reason: 'Résultat déjà existant'
      });
      this.skippedResults++;
      return;
    }

    this.previewData.push({
      type: 'resultat',
      action: 'create',
      data: result
    });
    this.newResults++;
    existingResults.push(result);

    const distinction = distinctionRules.getDistinction(result);

    if (distinction) {
      const key = `${archer.id}_${result.arme}_${distinction.discipline}_${distinction.distance}`;
      const existingBest = bestDistinctionsFromUpload.get(key);

      if (!existingBest) {
        bestDistinctionsFromUpload.set(key, {
          archerId: archer.id,
          nom: distinction.nom,
          resultatId: 'temp_result',
          statut: 'A commander',
          distance: distinction.distance,
          discipline: distinction.discipline,
          arme: result.arme,
          archerNom: archer.nom,
          archerPrenom: archer.prenom,
          score: result.score,
          dateDebutConcours: result.dateDebutConcours
        });
      } else {
        const sameOrBetter = distinctionRules.getSameOrBetter(
          distinction.nom,
          distinction.discipline,
          result.arme
        );

        if (sameOrBetter && !sameOrBetter.includes(existingBest.nom)) {
          bestDistinctionsFromUpload.set(key, {
            archerId: archer.id,
            nom: distinction.nom,
            resultatId: 'temp_result',
            statut: 'A commander',
            distance: distinction.distance,
            discipline: distinction.discipline,
            arme: result.arme,
            archerNom: archer.nom,
            archerPrenom: archer.prenom,
            score: result.score,
            dateDebutConcours: result.dateDebutConcours
          });
        }
      }
    }
  }

  async confirmImport() {
    try {
      this.step = 'importing';
      this.progress = 0;
      this.successMessage = '';
      this.errorMessage = '';

      const itemsToCreate = this.previewData.filter(item => item.action === 'create');
      this.totalItems = itemsToCreate.length;
      this.processedItems = 0;

      const archerIdMap = new Map<string, string>();
      const resultatIdMap = new Map<string, string>();

      for (const item of itemsToCreate.filter(i => i.type === 'archer')) {
        const archerData = {
          ...item.data,
          role: 'archer',
          createdAt: Timestamp.now()
        };
        const docRef = await this.firestoreService.addArcher(archerData);
        archerIdMap.set(item.data.noLicence, docRef.id);

        this.processedItems++;
        this.progress = Math.round((this.processedItems / this.totalItems) * 100);
      }

      for (const item of itemsToCreate.filter(i => i.type === 'resultat')) {
        const resultData = { ...item.data };

        if (resultData.archerId.startsWith('temp_')) {
          const licence = resultData.archerId.replace('temp_', '');
          resultData.archerId = archerIdMap.get(licence) || resultData.archerId;
        }

        resultData.dateDebutConcours = Timestamp.fromDate(resultData.dateDebutConcours);

        // Nettoyer les propriétés d'affichage
        delete resultData.archerNom;
        delete resultData.archerPrenom;

        const docRef = await this.firestoreService.addResultat(resultData);
        // Clé basée sur l'archerId original (temp_) pour retrouver le résultat depuis les distinctions
        resultatIdMap.set(JSON.stringify(item.data), docRef.id);

        this.processedItems++;
        this.progress = Math.round((this.processedItems / this.totalItems) * 100);
      }

      for (const item of itemsToCreate.filter(i => i.type === 'distinction')) {
        const distinctionData = { ...item.data };
        const originalArcherId = distinctionData.archerId;

        if (distinctionData.archerId.startsWith('temp_')) {
          const licence = distinctionData.archerId.replace('temp_', '');
          distinctionData.archerId = archerIdMap.get(licence) || distinctionData.archerId;
        }

        // Recherche avec l'archerId ORIGINAL (temp_) car item.data n'est pas muté
        const correspondingResultItem = itemsToCreate.find(i =>
          i.type === 'resultat' &&
          i.data.archerId === originalArcherId &&
          i.data.distance === distinctionData.distance &&
          i.data.discipline === distinctionData.discipline
        );

        if (correspondingResultItem) {
          distinctionData.resultatId = resultatIdMap.get(JSON.stringify(correspondingResultItem.data));
          console.log(`[Import] Distinction "${distinctionData.nom}" : resultatId=${distinctionData.resultatId} (trouvé=${!!distinctionData.resultatId})`);
        } else {
          console.warn(`[Import] Distinction "${distinctionData.nom}" : aucun résultat correspondant trouvé (archerId=${originalArcherId}, discipline=${distinctionData.discipline}, distance=${distinctionData.distance})`);
        }

        delete distinctionData.archerNom;
        delete distinctionData.archerPrenom;
        delete distinctionData.score;
        delete distinctionData.dateDebutConcours;

        await this.firestoreService.addDistinction(distinctionData);

        this.processedItems++;
        this.progress = Math.round((this.processedItems / this.totalItems) * 100);
      }

      console.log(`[Import] Terminé : ${this.newArchers} archers, ${this.newResults} résultats, ${this.newDistinctions} distinctions`);
      this.successMessage = `Import terminé : ${this.newArchers} archers, ${this.newResults} résultats, ${this.newDistinctions} distinctions créés !`;
      this.step = 'done';

    } catch (error: any) {
      console.error('[Import] Erreur :', error);
      this.errorMessage = `Erreur lors de l'import: ${error.message}`;
      this.step = 'preview';
    }
  }

  cancelImport() {
    this.reset();
  }

  reset() {
    this.step = 'upload';
    this.previewData = [];
    this.parsedResults = [];
    this.newArchers = 0;
    this.newResults = 0;
    this.newDistinctions = 0;
    this.skippedResults = 0;
    this.progress = 0;
    this.successMessage = '';
    this.errorMessage = '';
    this.totalItems = 0;
    this.processedItems = 0;
  }

  parseCSV(text: string): ResultRaw[] {
    const lines = text.split('\n');
    const results: ResultRaw[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(';');
      if (columns.length < 10) continue;
      
      const result: ResultRaw = new ResultRaw(columns);
      results.push(result);
    }
    
    return results;
  }

  parseDate(dateStr: string): Date {
    if (dateStr.includes('-')) {
      return new Date(dateStr);
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateStr);
  }

  get previewArchers() {
    return this.previewData.filter(item => item.type === 'archer');
  }

  get previewResults() {
    return this.previewData.filter(item => item.type === 'resultat');
  }

  get previewDistinctions() {
    return this.previewData
      .filter(item => item.type === 'distinction')
      .sort((a, b) =>
        `${a.data.archerNom} ${a.data.archerPrenom}`.localeCompare(
          `${b.data.archerNom} ${b.data.archerPrenom}`
        )
      );
  }

  get getSkippedResults() {
    return this.previewResults.filter(r => r.action === 'skip');
  }
  
  get getNewResults() {
    return this.previewResults.filter(r => r.action === 'create');
  }
  
  toggleFormatHelp() {
    this.showFormatHelp = !this.showFormatHelp;
  }
  
  getArmeFromDistinction(item: PreviewItem): string {
    return item.data.arme || '';
  }
}