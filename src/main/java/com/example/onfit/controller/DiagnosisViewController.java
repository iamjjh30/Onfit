package com.example.onfit.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;

@Controller
public class DiagnosisViewController {

    @GetMapping("/diagnosis/result")
    public String showResultPage(@RequestParam(name = "type", defaultValue = "spring_warm") String type, Model model) {

        // 1. 타입을 모델에 저장 (CSS 클래스용)
        model.addAttribute("type", type);

        // 2. 타입별 데이터 세팅 (성중립적 문구로 변경됨)
        switch (type) {
            case "spring_warm":
                model.addAttribute("title", "봄 웜톤 (Spring Warm)");
                model.addAttribute("description", "따뜻하고 생동감 넘치는 봄의 에너지를 가졌습니다.<br>밝은 아이보리, 코랄, 옐로우 톤이 당신의 활기찬 이미지를 돋보이게 합니다.");
                model.addAttribute("palette", Arrays.asList("#FF7B7B", "#FFD700", "#FF9E80", "#E6E6FA"));
                // 특징: '어려 보이는' -> '밝은', '주얼리' -> '스타일링'
                model.addAttribute("features", Arrays.asList("밝고 친근한 이미지", "경쾌한 캐주얼룩 추천", "명도와 채도가 높은 색상 활용"));
                break;

            case "summer_cool":
                model.addAttribute("title", "여름 쿨톤 (Summer Cool)");
                model.addAttribute("description", "청량하고 깨끗한 여름의 이미지를 가졌습니다.<br>파스텔 톤과 소프트한 블루, 그레이가 깔끔하고 세련된 분위기를 완성합니다.");
                model.addAttribute("palette", Arrays.asList("#6E85B7", "#D8BFD8", "#B0C4DE", "#F0F8FF"));
                // 특징: '청순한' -> '단정한', '주얼리' -> '소재'
                model.addAttribute("features", Arrays.asList("단정하고 부드러운 이미지", "린넨, 면 등 가벼운 소재 추천", "그레이시하고 차분한 색상 활용"));
                break;

            case "autumn_warm":
                model.addAttribute("title", "가을 웜톤 (Autumn Warm)");
                model.addAttribute("description", "깊이 있고 차분한 가을의 분위기를 가졌습니다.<br>브라운, 카키, 딥한 오렌지 컬러가 당신의 클래식하고 편안한 매력을 더해줍니다.");
                model.addAttribute("palette", Arrays.asList("#8B4513", "#D2691E", "#556B2F", "#F4A460"));
                // 특징: '성숙한/음영메이크업' -> '클래식한/레이어드'
                model.addAttribute("features", Arrays.asList("차분하고 신뢰감 있는 이미지", "클래식하고 내추럴한 스타일링", "깊이감 있는 어두운 색상 활용"));
                break;

            case "winter_cool":
                model.addAttribute("title", "겨울 쿨톤 (Winter Cool)");
                model.addAttribute("description", "선명하고 도시적인 겨울의 카리스마를 가졌습니다.<br>블랙&화이트의 강한 대비와 비비드한 컬러가 모던하고 강렬한 존재감을 줍니다.");
                model.addAttribute("palette", Arrays.asList("#000000", "#FFFFFF", "#C71585", "#000080"));
                // 특징: '도회적/다이아몬드' -> '모던/포멀룩'
                model.addAttribute("features", Arrays.asList("모던하고 시크한 이미지", "깔끔한 핏의 포멀룩 추천", "블랙 & 화이트의 강한 대비 활용"));
                break;

            default:
                model.addAttribute("title", "퍼스널 컬러");
                model.addAttribute("description", "분석 결과를 불러오는 중입니다.");
                break;
        }

        return "diagnosisResult";
    }
}